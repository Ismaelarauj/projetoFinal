module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                'innovate-blue': '#1E3A8A', // Azul escuro institucional
                'innovate-accent': '#60A5FA', // Azul claro para destaques
                'innovate-gray': '#E5E7EB', // Cinza suave
                'innovate-dark': '#111827', // Cinza escuro para texto
            },
            fontFamily: {
                'sans': ['"Merriweather", Georgia, serif'], // Fonte serif elegante
                'display': ['"Playfair Display", serif'], // Fonte para títulos
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')", // Imagem de fundo criativa
            },
        },
    },
    plugins: [],
};