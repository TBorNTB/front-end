"use client";

import React from 'react';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

interface TitleBannerProps {
  title: string;
  description?: string;
  backgroundImage?: string;
  className?: string;
  containerClassName?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  cornerColorClassName?: string;
  cornerInsetClassName?: string;
  children?: React.ReactNode;
}

/**
 * Reusable full-width hero/banner with background image, gradient overlay, and corner brackets.
 */
export function TitleBanner({
  title,
  description,
  backgroundImage = "/images/BgHeader.png",
  className,
  containerClassName,
  gradientFrom = "from-black/60",
  gradientVia = "via-black/40",
  gradientTo = "to-black/30",
  cornerColorClassName = "border-primary-400",
  cornerInsetClassName = "inset-4",
  children,
}: TitleBannerProps) {
  return (
    <div
      className={cx(
        "relative w-full overflow-hidden bg-cover bg-center",
        className
      )}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={cx("absolute inset-0 bg-gradient-to-r", gradientFrom, gradientVia, gradientTo)}></div>

      <div className={cx("pointer-events-none absolute", cornerInsetClassName)}>
        <div className={cx("absolute top-0 left-0 w-8 h-8 border-2 border-r-0 border-b-0", cornerColorClassName)}></div>
        <div className={cx("absolute top-0 right-0 w-8 h-8 border-2 border-l-0 border-b-0", cornerColorClassName)}></div>
        <div className={cx("absolute bottom-0 left-0 w-8 h-8 border-2 border-r-0 border-t-0", cornerColorClassName)}></div>
        <div className={cx("absolute bottom-0 right-0 w-8 h-8 border-2 border-l-0 border-t-0", cornerColorClassName)}></div>
      </div>

      <div className={cx("container relative mx-auto px-6 sm:px-10 py-12 sm:py-16 text-center", containerClassName)}>
        {children ?? (
          <>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">{title}</h1>
            {description ? (
              <p className="mt-3 text-secondary-300 text-base sm:text-lg">{description}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default TitleBanner;
