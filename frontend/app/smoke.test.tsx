import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Smoke Test', () => {
  it('should render a basic element', () => {
    render(<h1>Smoke Test</h1>)
    expect(screen.getByText('Smoke Test')).toBeInTheDocument()
  })
})
