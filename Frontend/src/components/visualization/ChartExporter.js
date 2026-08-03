export const exportChartAsImage = (chartRef, fileName = 'chart.png', type = 'image/png') => {
  if (!chartRef.current) return;
  
  // Get the base64 image URL from the Chart.js canvas
  const url = chartRef.current.toBase64Image(type, 1.0);
  
  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  
  // Trigger click and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
