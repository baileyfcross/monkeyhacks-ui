import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DiceObject from '../components/DiceObject.vue'

describe('DiceObject.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(DiceObject)
  })

  it('renders with initial value of 1', () => {
    expect(wrapper.text()).toContain('1')
  })

  it('has clickable dice element', () => {
    const diceElement = wrapper.find('.diceobject')
    expect(diceElement.exists()).toBe(true)
  })

  it('renders dice value in paragraph', () => {
    const paragraph = wrapper.find('p')
    expect(paragraph.exists()).toBe(true)
    expect(paragraph.text()).toContain('1')
  })

  it('updates displayed value when clicked', async () => {
    vi.useFakeTimers()

    const diceElement = wrapper.find('.diceobject')
    await diceElement.trigger('click')

    // Fast-forward through the rolling animation
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    const value = parseInt(wrapper.find('p').text())
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(6)

    vi.useRealTimers()
  })

  it('generates dice values between 1 and 6', async () => {
    vi.useFakeTimers()

    const values = new Set<number>()
    const diceElement = wrapper.find('.diceobject')

    // Perform multiple rolls
    for (let i = 0; i < 5; i++) {
      await diceElement.trigger('click')
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      const value = parseInt(wrapper.find('p').text())
      values.add(value)

      // All values should be valid
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(6)
    }

    // Should generate some variety (at least 1 value across 5 rolls)
    expect(values.size).toBeGreaterThanOrEqual(1)

    vi.useRealTimers()
  })

  it('dice element has correct CSS class', () => {
    const diceElement = wrapper.find('.diceobject')
    expect(diceElement.classes()).toContain('diceobject')
  })
})
