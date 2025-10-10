## Welcome! 👋

Thank you for participating in this frontend assessment. This project showcases a real-world order management interface with timeline visualization.

## Your Task

You will be working on enhancing and demonstrating your understanding of this order timeline interface. Here are general areas you might explore:

### Potential Enhancement Areas

1. **UI/UX Improvements**
   - Enhance the visual design
   - Add micro-interactions
   - Optimize responsive behavior

2. **Feature Additions**
   - Add filtering capabilities
   - Implement search functionality
   - Create additional visualizations

3. **Performance Optimizations**
   - Optimize re-renders
   - Improve virtualization for large lists
   - Add caching strategies

4. **Code Quality**
   - Refactor complex components
   - Add error boundaries
   - Write unit tests

## 🎯 Project Overview

This is a frontend assessment project that displays a comprehensive order management interface with:

- **Timeline Visualization**: Interactive timeline showing production and shipping phases
- **Order Tracking**: Real-time tracking information for shipped orders
- **Payment Management**: Continuation of pending payments with price change notifications
- **Responsive Design**: Mobile-first responsive layout using Tailwind CSS
- **Modern UI**: Built with Radix UI components and shadcn/ui patterns

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd order-timeline-candidate-project
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
and use `NEXT_PUBLIC_USE_MOCK_DATA=true`

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
order-timeline-candidate-project/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   ├── OrderList.tsx      # Main order list component
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── order/             # Order-specific components
│   │   │   ├── TimelineView.tsx        # Timeline visualization
│   │   │   ├── PriceChangeModal.tsx    # Price change modal
│   │   │   ├── OrderSortSelect.tsx     # Sort dropdown
│   │   │   ├── useOrderSort.ts         # Sort hook
│   │   │   └── useTimelineCalculation.ts # Timeline calculations
│   │   └── quote/
│   │       └── PresignedImage.tsx      # S3 image component
│   ├── lib/
│   │   ├── api/               # API clients
│   │   │   ├── client.ts     # Base API client
│   │   │   ├── orderClient.ts # Order API client
│   │   │   └── messageClient.ts # Message/attachment API client
│   │   ├── auth/
│   │   │   └── AuthContext.tsx # Authentication context
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── order.ts           # TypeScript type definitions
│   └── config/
│       └── api.ts             # API configuration
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
└── README.md                  # This file
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15.1.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect, useMemo)

## 📦 Main Dependencies

```json
{
  "next": "15.1.4",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^3.4.17",
  "@radix-ui/react-*": "Various versions",
  "lucide-react": "^0.471.1"
}
```

## 📞 Support

For questions about this project or the assessment, please contact us via email.

**Good luck with your assessment!** 🚀

Feel free to explore the codebase, make improvements, or add new features to demonstrate your skills.
