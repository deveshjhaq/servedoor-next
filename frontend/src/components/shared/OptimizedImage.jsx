import React, { useState } from 'react';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = DEFAULT_FALLBACK,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <img
      src={imgSrc}
      alt={alt || ''}
      width={width}
      height={height}
      loading="lazy"
      className={className}
      onError={() => setImgSrc(fallback)}
      {...rest}
    />
  );
};

export default OptimizedImage;
