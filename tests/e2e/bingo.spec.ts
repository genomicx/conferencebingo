import { test, expect } from '@playwright/test'

test.describe('Conference Bingo e2e — card generation and interaction', () => {
  test('loads the page with mode tabs and generate controls', async ({ page }) => {
    await page.goto('/')

    // Mode tabs should be visible
    await expect(page.getByRole('tab', { name: /conference bingo/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /number bingo/i })).toBeVisible()

    // Generate and Random buttons
    await expect(page.getByRole('button', { name: /generate/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /random/i })).toBeVisible()
  })

  test('clicking Random generates a bingo card with 25 cells', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /random/i }).click()

    // The bingo card grid should appear with data-testid="bingo-card"
    const card = page.locator('[data-testid="bingo-card"]')
    await expect(card).toBeVisible({ timeout: 10_000 })

    // 5x5 = 25 cells
    const cells = page.locator('.bingo-cell')
    await expect(cells).toHaveCount(25)
  })

  test('clicking a cell marks it as checked', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /random/i }).click()

    const card = page.locator('[data-testid="bingo-card"]')
    await expect(card).toBeVisible({ timeout: 10_000 })

    // The center cell (index 12) is the free space — always checked
    // Click the first non-free cell (index 0)
    const firstCell = page.locator('.bingo-cell').first()
    await expect(firstCell).not.toHaveClass(/checked/)

    await firstCell.click()

    await expect(firstCell).toHaveClass(/checked/)
  })

  test('switching to Number Bingo mode and generating shows BINGO headers', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('tab', { name: /number bingo/i }).click()
    await page.getByRole('button', { name: /random/i }).click()

    const card = page.locator('[data-testid="bingo-card"]')
    await expect(card).toBeVisible({ timeout: 10_000 })

    // Number mode renders BINGO column headers
    await expect(page.locator('.bingo-header-cell').first()).toBeVisible()
  })
})
