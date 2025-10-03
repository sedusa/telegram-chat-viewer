// Test script to verify dark mode
console.log('=== Dark Mode Test ===');
console.log('Current localStorage darkMode:', localStorage.getItem('darkMode'));
console.log('HTML classList:', document.documentElement.classList.toString());
console.log('Has dark class:', document.documentElement.classList.contains('dark'));

// Toggle test
console.log('\nToggling dark mode...');
const isDark = document.documentElement.classList.contains('dark');
if (isDark) {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', 'false');
  console.log('Switched to LIGHT mode');
} else {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'true');
  console.log('Switched to DARK mode');
}
console.log('New HTML classList:', document.documentElement.classList.toString());
console.log('===================');
