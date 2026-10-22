// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
})
afterEach(cleanup)

async function pickPlan(user) {
  await user.click(screen.getByRole('radio', { name: '5K' }))
  await user.click(screen.getByRole('radio', { name: 'Beginner' }))
  await user.click(screen.getByRole('button', { name: /Sub 40:00/ }))
}

describe('app flow', () => {
  it('shows the plan picker first, then the plan overview', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText('Choose your plan')).toBeTruthy()
    await pickPlan(user)
    expect(await screen.findByText(/5K · Sub 40:00/)).toBeTruthy()
  })

  it('week view has Next week, then both Prev and Next', async () => {
    const user = userEvent.setup()
    render(<App />)
    await pickPlan(user)
    await user.click(await screen.findByRole('button', { name: /^Week 1(?!\d)/ }))
    expect(screen.queryByRole('button', { name: /Prev week/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: /Next week/ }))
    expect(screen.getByText('Week 2 of 10')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Prev week/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Next week/ })).toBeTruthy()
  })

  it('Next day on week 1 day 7 moves to week 2 day 1 and can be marked done', async () => {
    const user = userEvent.setup()
    window.location.hash = ''
    render(<App />)
    await pickPlan(user)
    window.location.hash = '#/plan/week/1/day/7'
    const nav = await screen.findByRole('navigation', { name: 'Day navigation' })
    expect(within(nav).getByText('W1 · D7')).toBeTruthy()
    await user.click(within(nav).getByRole('button', { name: /Next day/ }))
    const nav2 = await screen.findByRole('navigation', { name: 'Day navigation' })
    expect(within(nav2).getByText('W2 · D1')).toBeTruthy()
    expect(within(nav2).getByRole('button', { name: /Prev day/ }).disabled).toBe(false)
    await user.click(within(nav2).getByRole('button', { name: /Prev day/ }))
    expect(within(await screen.findByRole('navigation', { name: 'Day navigation' })).getByText('W1 · D7')).toBeTruthy()

    const doneBtn = screen.getByRole('button', { name: /Mark day as done/ })
    await user.click(doneBtn)
    expect(screen.getByRole('button', { name: /Done \(tap to undo\)/ })).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('rtp.v1')).done['5k-beginner-sub40:w1d7']).toBe(true)
  })

  it('session steps are ordered stretching -> warm-up -> main -> cool-down -> stretching', async () => {
    const user = userEvent.setup()
    render(<App />)
    await pickPlan(user)
    window.location.hash = '#/plan/week/1/day/4'
    await screen.findByRole('navigation', { name: 'Day navigation' })
    const kinds = [...document.querySelectorAll('.step-kind')].map((n) => n.textContent)
    expect(kinds[0]).toBe('Stretching')
    expect(kinds[1]).toBe('Warm-up')
    expect(kinds.at(-1)).toBe('Stretching')
    expect(kinds.at(-2)).toBe('Cool-down')
  })

  it('records a run and shows it in history', async () => {
    const user = userEvent.setup()
    render(<App />)
    await pickPlan(user)
    window.location.hash = '#/log'
    await user.type(await screen.findByLabelText(/Distance \(km\)/), '10')
    await user.type(screen.getByLabelText(/Time \(mm:ss/), '52:30')
    await user.type(screen.getByLabelText(/Avg heart rate/), '148')
    await user.click(screen.getByRole('button', { name: 'Save run' }))
    expect(await screen.findByText(/Saved/)).toBeTruthy()
    expect(screen.getByText(/10.0 km · 52:30 · 5:15 \/km · 148 bpm/)).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('rtp.v1')).logs).toHaveLength(1)
  })

  it('rejects an invalid time on the recorder', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/log'
    await user.type(await screen.findByLabelText(/Distance \(km\)/), '5')
    await user.type(screen.getByLabelText(/Time \(mm:ss/), 'abc')
    await user.click(screen.getByRole('button', { name: 'Save run' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('glossary search filters terms', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/glossary'
    await user.type(await screen.findByLabelText('Search glossary'), 'fartlek')
    expect(screen.getAllByText('Fartlek').length).toBeGreaterThan(0)
  })
})
