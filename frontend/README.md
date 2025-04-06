# File Compressor React Frontend

This is the React frontend for the File Compressor application. It provides a modern, user-friendly interface for compressing files using the backend compression service.

## Features

- Drag and drop file upload
- Visual feedback during compression
- Display of compression results and stats
- Support for already compressed files
- Download of compressed files

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

### Running the Frontend

Start the development server:

```bash
npm start
```

or

```bash
yarn start
```

This will start the React application on [http://localhost:3000](http://localhost:3000).

## Using with the Backend

Make sure the backend server is running on port 3000 before using the frontend. You can start both the backend and frontend together by running the following command from the root directory:

```bash
npm run dev
```

## Building for Production

To create a production build:

```bash
npm run build
```

or

```bash
yarn build
```

This will create optimized files in the `build` directory that you can deploy to a web server.

## Technology Stack

- React
- JavaScript/ES6+
- CSS3
- Font Awesome for icons
