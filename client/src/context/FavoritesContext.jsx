import React, { createContext, useContext, useState, useMemo } from 'react';
import { favorite as favoriteApi } from '../api';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children, initialFavorites = [] }) => {
    // sessionToggles stores the user's explicit actions during this session.
    // { [audioId]: true (favorited) | false (unfavorited) }
    const [sessionToggles, setSessionToggles] = useState({});

    // Memoize the initial set for O(1) lookups
    const initialFavoritedSet = useMemo(() => new Set(initialFavorites), [initialFavorites]);

    /**
     * getDisplayState calculates the current visual state of an audio item.
     * Reconciliation happens solely on the client-side.
     */
    const getDisplayState = (audioId, serverCount) => {
        const isInitialFavorited = initialFavoritedSet.has(audioId);
        const sessionState = sessionToggles[audioId];

        // Final favorite status: session state take precedence, then initial list
        const isFavoritedNow = sessionState !== undefined ? sessionState : isInitialFavorited;

        // Calculate count delta based on current VS initial state
        let delta = 0;
        if (isFavoritedNow && !isInitialFavorited) delta = 1;
        if (!isFavoritedNow && isInitialFavorited) delta = -1;

        return {
            isFavorited: isFavoritedNow,
            count: (serverCount || 0) + delta
        };
    };

    /**
     * toggleFavorite handles the interaction with the backend.
     * It updates the session state optimistically.
     */
    const toggleFavorite = async (audioId) => {
        const isInitialFavorited = initialFavoritedSet.has(audioId);
        const currentState = sessionToggles[audioId] ?? isInitialFavorited;
        const nextState = !currentState;

        // 1. Optimistic Update
        setSessionToggles(prev => ({ ...prev, [audioId]: nextState }));

        try {
            const { data } = await favoriteApi(audioId);
            return data;
        } catch (err) {
            // 2. Rollback on failure
            setSessionToggles(prev => ({ ...prev, [audioId]: currentState }));
            throw err;
        }
    };

    return (
        <FavoritesContext.Provider value={{ toggleFavorite, getDisplayState }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
