import { useEffect } from 'react';

const useNoindex = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      if (meta.parentNode) {
        meta.parentNode.removeChild(meta);
      }
    };
  }, []);
};

export default useNoindex;