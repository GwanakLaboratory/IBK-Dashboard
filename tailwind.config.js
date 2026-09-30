/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 기본 Tailwind 스케일보다 1~2px씩 키워서, 앱 전체 텍스트 크기를 여기 한 곳에서 관리한다.
      fontSize: {
        xs: ['13px', { lineHeight: '18px' }],
        sm: ['15px', { lineHeight: '21px' }],
        base: ['17px', { lineHeight: '25px' }],
        lg: ['19px', { lineHeight: '27px' }],
        xl: ['21px', { lineHeight: '29px' }],
        '2xl': ['25px', { lineHeight: '33px' }],
        '3xl': ['31px', { lineHeight: '37px' }],
        '4xl': ['37px', { lineHeight: '41px' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#466CFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: '#0C1426',
          border: '#1A2440',
          active: '#1B2A4A',
          muted: '#8B95A8',
          panel: '#F2F4F8',
          'panel-border': '#E3E7EE',
          'panel-muted': '#5B6472',
        },
        topbar: {
          border: '#2A3550',
          'button-border': '#3A4663',
          muted: '#C7CEDB',
        },
        surface: '#F5F6F8',
      },
      keyframes: {
        // AI 문구 생성 로딩: 테두리 그라데이션이 흐르고 스켈레톤 위로 빛이 지나간다
        'ai-gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'ai-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'ai-gradient': 'ai-gradient 3s ease infinite',
        'ai-shimmer': 'ai-shimmer 1.8s linear infinite',
      },
      boxShadow: {
        panel: '0 16px 48px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)',
        launcher: '0 4px 20px rgba(29, 78, 216, 0.45)',
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
