module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                'innovate-blue': 'var(--innovate-blue, #1E3A8A)',
                'innovate-accent': 'var(--innovate-accent, #9333EA)',
                'neon-green': 'var(--neon-green, #00FF40)',
                'dark-bg': 'var(--dark-bg, #0A0F1A)',
                'glass-bg': 'var(--glass-bg, rgba(255, 255, 255, 0.1))',
                'innovate-gray': '#F5F7FA',
                'blue-900': '#1E3A8A',
                'blue-700': '#1E40AF',
                'blue-600': '#2563EB',
                'blue-500': '#3B82F6',
                'green-100': '#A3E4D7',
                'green-700': '#047857',
                'red-100': '#FEE2E2',
                'red-700': '#DC2626',
                'gray-100': '#F5F7FA',
                'gray-600': '#4B5563',
                'gray-800': '#1F2937',
            },
            fontFamily: {
                'sans': ['"Poppins", sans-serif'],
                'display': ['"Playfair Display", serif'],
                'mono': ['"Orbitron", monospace'],
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
                'matrix-rain': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1440 320\"%3E%3Cpath fill=\"%2300ff40\" fill-opacity=\"0.1\" d=\"M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,106.7C960,85,1056,107,1152,117.3C1248,128,1344,128,1392,128L1440,128V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z\"/%3E%3Ctext x=\"50%\" y=\"50%\" font-family=\"monospace\" font-size=\"20\" fill=\"%2300ff40\" text-anchor=\"middle\" dominant-baseline=\"middle\"%3E010101%3C/text%3E%3C/svg%3E')",
            },
        },
    },
    plugins: [],
};