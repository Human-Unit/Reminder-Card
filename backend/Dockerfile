# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -v -ldflags="-s -w" -o server ./cmd/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies (like ca-certificates)
RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/server .
# Copy .env.example if needed as a template
COPY .env.example .env

EXPOSE 8080

CMD ["./server"]
