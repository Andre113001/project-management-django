import { useEffect } from 'react';
import Hammer from 'hammerjs';

const useSwipeRefresh = (onRefresh) => {
    useEffect(() => {
        const handleSwipe = (event) => {
            if (event.direction === Hammer.DIRECTION_DOWN && event.distance > 50) {
                onRefresh();
            }
        };

        const element = document.getElementById('swipe-container');
        const mc = new Hammer(element);
        mc.on('swipedown', handleSwipe);

        return () => {
            mc.off('swipedown', handleSwipe);
        };
    }, [onRefresh]);
};

export default useSwipeRefresh;
