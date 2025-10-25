"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { motion, AnimatePresence } from "framer-motion";

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function RouteTransition({
  children,
  className = "",
}: RouteTransitionProps) {
  const { currentRoute, isNavigating } = useNavigation();
  const [displayedRoute, setDisplayedRoute] = useState(currentRoute);

  useEffect(() => {
    if (!isNavigating) {
      setDisplayedRoute(currentRoute);
    }
  }, [currentRoute, isNavigating]);

  const getTransitionDirection = () => {
    // Determine transition direction based on route depth
    const currentDepth = currentRoute.split("/").length;
    const displayedDepth = displayedRoute.split("/").length;

    return currentDepth > displayedDepth ? "forward" : "backward";
  };

  const variants = {
    initial: (direction: string) => ({
      x: direction === "forward" ? 100 : -100,
      opacity: 0,
    }),
    in: {
      x: 0,
      opacity: 1,
    },
    out: (direction: string) => ({
      x: direction === "forward" ? -100 : 100,
      opacity: 0,
    }),
  };

  const transition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3,
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence
        mode="wait"
        custom={getTransitionDirection()}
        onExitComplete={() => setDisplayedRoute(currentRoute)}
      >
        <motion.div
          key={displayedRoute}
          custom={getTransitionDirection()}
          variants={variants}
          initial="initial"
          animate="in"
          exit="out"
          transition={transition}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
