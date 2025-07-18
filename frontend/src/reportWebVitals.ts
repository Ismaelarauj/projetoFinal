const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry) {
    import('web-vitals').then((module: any) => {
      module.onCLS(onPerfEntry);
      module.onFID(onPerfEntry);
      module.onFCP(onPerfEntry);
      module.onLCP(onPerfEntry);
      module.onTTFB(onPerfEntry);
    }).catch((error) => {
      console.error('Erro ao carregar web-vitals:', error);
    });
  }
};

export default reportWebVitals;