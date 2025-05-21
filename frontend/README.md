# Senator Trading Analysis Frontend

A React TypeScript application for analyzing U.S. Senator stock trading data with interactive visualizations and real-time analytics.

## Features

- **Interactive Dashboard**: Real-time analytics and visualizations
- **Transaction Database**: Searchable and filterable trading records  
- **Timeline Analysis**: Time-based trading pattern analysis
- **Risk Assessment**: ML-powered suspicious trading detection
- **Senator Profiles**: Individual senator trading analysis

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks
- **Routing**: React Router DOM

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   └── data/            # Mock data and types
├── public/              # Static assets
└── package.json         # Dependencies
```

## API Integration

The frontend communicates with the backend API at `http://localhost:8000`:

- `/api/transactions` - Get paginated transactions
- `/api/senator-risk` - Get senator risk profiles  
- `/api/statistics` - Get summary statistics
- `/api/chart-data` - Get data for charts
- `/api/filters` - Get available filter options

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for all components
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

## Deployment

### Using the Launcher Script
```bash
# From project root
python3 run_dashboard.py
```

### Manual Deployment
1. Build the app: `npm run build`
2. Serve the `dist` folder with a static file server
3. Ensure the backend API is running

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure port 8080 is available
2. **API connection**: Ensure the backend server is running on port 8000
3. **Build errors**: Check Node.js version and dependencies

### Debug Mode
```bash
npm run dev -- --debug
```

## Contributing

1. Follow the established directory structure
2. Use TypeScript for all new components
3. Follow the existing code style and patterns
4. Test your changes thoroughly
