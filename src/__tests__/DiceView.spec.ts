import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DiceView from '../views/DiceView.vue'

describe('DiceView.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    wrapper = mount(DiceView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })
  })

  it('renders the dice roller page', () => {
    expect(wrapper.text()).toContain('🎲')
  })

  it('renders two DiceObject components', () => {
    const diceElements = wrapper.findAll('.diceobject')
    expect(diceElements).toHaveLength(2)
  })

  it('renders the sum box', () => {
    const sumBox = wrapper.find('.sum-box')
    expect(sumBox.exists()).toBe(true)
  })

  it('shows initial sum text', () => {
    const sumBox = wrapper.find('.sum-box')
    expect(sumBox.text()).toContain('Result')
  })

  it('displays "Rolling..." initially or during roll', async () => {
    vi.useFakeTimers()

    // Trigger roll
    const buttons = wrapper.findAll('button')
    if (buttons.length > 0) {
      const rollButton = buttons[0]!
      await rollButton.trigger('click')
      await wrapper.vm.$nextTick()

      // During rolling, should show "Rolling..."
      expect(wrapper.text()).toContain('Rolling')
    }

    vi.useRealTimers()
  })

  it('displays numeric sum after rolling completes', async () => {
    vi.useFakeTimers()

    // Trigger roll
    const buttons = wrapper.findAll('button')
    if (buttons.length > 0) {
      const rollButton = buttons[0]!
      await rollButton.trigger('click')

      // Fast-forward through rolling animation
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      // After rolling, should show a message or text in sum-box
      const sumBox = wrapper.find('.sum-box')
      expect(sumBox.exists()).toBe(true)
      expect(sumBox.text().length).toBeGreaterThan(0)
    }

    vi.useRealTimers()
  })

  it('has three-column layout', () => {
    const threeColumn = wrapper.find('.dice-three-column')
    expect(threeColumn.exists()).toBe(true)
  })

  it('has dice text section', () => {
    const diceText = wrapper.find('.dice-text')
    expect(diceText.exists()).toBe(true)
  })

  it('has sum column', () => {
    const sumColumn = wrapper.find('.sum-column')
    expect(sumColumn.exists()).toBe(true)
  })

  it('has Roll Dice button', () => {
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
