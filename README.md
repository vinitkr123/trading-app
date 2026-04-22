# Trading App

A stock trading mobile app built with React Native (Expo) + Spring Boot.

## Structure

```
trading-app/
├── mobile/        # React Native (Expo) - iOS & Android
└── backend/       # Spring Boot REST API
```

## Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your iPhone.

## Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

API runs at `http://localhost:8080`

## Features

- Live stock prices & charts
- Portfolio tracker (holdings, P&L)
- Buy / Sell orders (paper trading)
- Multiple watchlists

## Stock Data

Uses [Alpha Vantage](https://www.alphavantage.co/) free API.  
Get a free key at alphavantage.co and add it to `backend/src/main/resources/application.properties`.
