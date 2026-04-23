import { supabaseAdmin } from "@/lib/supabase/admin"

export type MatchType = 'five_match' | 'four_match' | 'three_match'
export type DrawMode = 'random' | 'weighted'
export type DrawStatus = 'pending' | 'simulated' | 'published'

export interface DrawSimulationResult {
  winningNumbers: number[]
  entries: {
    userId: string
    submittedNumbers: number[]
    matchCount: number
    isWinner: boolean
    matchType: MatchType | null
  }[]
  winnerCount: { five: number, four: number, three: number }
  prizeBreakdown: {
    jackpot: number
    fourMatch: number
    threeMatch: number
    rollover: number
  }
}

/**
 * Generate unique random integers between min and max inclusive
 */
export function generateRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>()
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    numbers.add(num)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Weighted selection by frequency of scores
 */
export function generateWeightedNumbers(allUserScores: number[], count: number): number[] {
  const frequencies: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) frequencies[i] = 0
  
  allUserScores.forEach(score => {
    if (score >= 1 && score <= 45) {
      frequencies[score] = (frequencies[score] || 0) + 1
    }
  })

  const winners = new Set<number>()
  const pool: number[] = []
  
  // Create a pool where each number appears frequency + 1 times (to ensure everyone has a chance)
  Object.entries(frequencies).forEach(([num, freq]) => {
    const n = parseInt(num)
    for (let i = 0; i < freq + 1; i++) {
      pool.push(n)
    }
  })

  while (winners.size < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length)
    const selected = pool[randomIndex]
    winners.add(selected)
    
    // Remove all instances of this number from pool to ensure uniqueness in final set
    let i = pool.length
    while (i--) {
      if (pool[i] === selected) pool.splice(i, 1)
    }
  }

  // Fallback to random if not enough unique values
  if (winners.size < count) {
    const fallback = generateRandomNumbers(count - winners.size, 1, 45)
    fallback.forEach(n => winners.add(n))
  }

  return Array.from(winners).sort((a, b) => a - b)
}

/**
 * Count matches between user scores and winning numbers
 */
export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers)
  return userScores.filter(num => winSet.has(num)).length
}

/**
 * Split prize pools among winners
 */
export function calculatePrizeShares(
  winners: { userId: string, matchType: MatchType }[],
  jackpotPool: number,
  fourMatchPool: number,
  threeMatchPool: number
): { userId: string, matchType: MatchType, prizeAmountPence: number }[] {
  const groupedWinners: Record<MatchType, string[]> = {
    five_match: [],
    four_match: [],
    three_match: []
  }

  winners.forEach(w => groupedWinners[w.matchType].push(w.userId))

  const results: { userId: string, matchType: MatchType, prizeAmountPence: number }[] = []

  // 5-match (Jackpot)
  if (groupedWinners.five_match.length > 0) {
    const share = Math.floor(jackpotPool / groupedWinners.five_match.length)
    groupedWinners.five_match.forEach(userId => {
      results.push({ userId, matchType: 'five_match', prizeAmountPence: share })
    })
  }

  // 4-match
  if (groupedWinners.four_match.length > 0) {
    const share = Math.floor(fourMatchPool / groupedWinners.four_match.length)
    groupedWinners.four_match.forEach(userId => {
      results.push({ userId, matchType: 'four_match', prizeAmountPence: share })
    })
  }

  // 3-match
  if (groupedWinners.three_match.length > 0) {
    const share = Math.floor(threeMatchPool / groupedWinners.three_match.length)
    groupedWinners.three_match.forEach(userId => {
      results.push({ userId, matchType: 'three_match', prizeAmountPence: share })
    })
  }

  return results
}

/**
 * Run a draw simulation without writing to DB
 */
export async function runDrawSimulation(drawId: string, mode: DrawMode): Promise<DrawSimulationResult> {
  // 1. Fetch draw from DB
  const { data: draw, error: drawError } = await supabaseAdmin
    .from('draws')
    .select('total_pool_pence, rollover_amount_pence, subscriber_count')
    .eq('id', drawId)
    .single()

  if (drawError || !draw) throw new Error("Draw not found")

  const totalPool = draw.total_pool_pence + (draw.rollover_amount_pence || 0)
  const jackpotPool = Math.floor(totalPool * 0.40)
  const fourMatchPool = Math.floor(totalPool * 0.35)
  const threeMatchPool = Math.floor(totalPool * 0.25)

  // 2. Fetch all active subscriptions
  const { data: activeSubs, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (subError) throw new Error("Failed to fetch active subscribers")

  const userIds = activeSubs.map(s => s.user_id)

  // 3. Fetch latest 5 scores for each user
  const entries: DrawSimulationResult['entries'] = []
  const allScoreValues: number[] = []

  for (const userId of userIds) {
    const { data: userScores } = await supabaseAdmin
      .from('scores')
      .select('score_value')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5)

    if (userScores && userScores.length > 0) {
      const scores = userScores.map(s => s.score_value)
      entries.push({
        userId,
        submittedNumbers: scores,
        matchCount: 0,
        isWinner: false,
        matchType: null
      })
      allScoreValues.push(...scores)
    }
  }

  // 4. Generate winning numbers
  let winningNumbers: number[]
  if (mode === 'weighted') {
    winningNumbers = generateWeightedNumbers(allScoreValues, 5)
  } else {
    winningNumbers = generateRandomNumbers(5, 1, 45)
  }

  // 5. Count matches and determine winners
  let fiveMatchCount = 0
  let fourMatchCount = 0
  let threeMatchCount = 0

  entries.forEach(entry => {
    const matches = countMatches(entry.submittedNumbers, winningNumbers)
    entry.matchCount = matches
    if (matches === 5) {
      entry.isWinner = true
      entry.matchType = 'five_match'
      fiveMatchCount++
    } else if (matches === 4) {
      entry.isWinner = true
      entry.matchType = 'four_match'
      fourMatchCount++
    } else if (matches === 3) {
      entry.isWinner = true
      entry.matchType = 'three_match'
      threeMatchCount++
    }
  })

  return {
    winningNumbers,
    entries,
    winnerCount: {
      five: fiveMatchCount,
      four: fourMatchCount,
      three: threeMatchCount
    },
    prizeBreakdown: {
      jackpot: jackpotPool,
      fourMatch: fourMatchPool,
      threeMatch: threeMatchPool,
      rollover: fiveMatchCount === 0 ? jackpotPool : 0
    }
  }
}

/**
 * Publish draw results to DB
 */
export async function publishDraw(drawId: string, result: DrawSimulationResult): Promise<void> {
  const { data: draw } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (!draw) throw new Error("Draw not found")

  // Update draw record
  const { error: updateError } = await supabaseAdmin
    .from('draws')
    .update({
      winning_numbers: result.winningNumbers,
      status: 'published',
      published_at: new Date().toISOString(),
      subscriber_count: result.entries.length,
      // Actual pool might have changed since pending, but we use what was calculated
    })
    .eq('id', drawId)

  if (updateError) throw new Error(`Failed to update draw: ${updateError.message}`)

  // Upsert draw entries
  const entryRows = result.entries.map(e => ({
    draw_id: drawId,
    user_id: e.userId,
    submitted_numbers: e.submittedNumbers,
    match_count: e.matchCount,
    is_winner: e.isWinner
  }))

  const { error: entryError } = await supabaseAdmin
    .from('draw_entries')
    .upsert(entryRows, { onConflict: 'draw_id,user_id' })

  if (entryError) throw new Error(`Failed to upsert entries: ${entryError.message}`)

  // Insert winners
  const winners = result.entries.filter(e => e.isWinner)
  const prizeShares = calculatePrizeShares(
    winners.map(w => ({ userId: w.userId, matchType: w.matchType! })),
    result.prizeBreakdown.jackpot,
    result.prizeBreakdown.fourMatch,
    result.prizeBreakdown.threeMatch
  )

  if (prizeShares.length > 0) {
    const winnerRows = prizeShares.map(p => ({
      draw_id: drawId,
      user_id: p.userId,
      match_type: p.matchType,
      prize_amount_pence: p.prizeAmountPence,
      status: 'pending'
    }))

    const { error: winnerError } = await supabaseAdmin
      .from('winners')
      .insert(winnerRows)

    if (winnerError) throw new Error(`Failed to insert winners: ${winnerError.message}`)
  }

  // Handle Rollover
  if (result.winnerCount.five === 0) {
    const nextMonth = new Date(draw.draw_month)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    // Check if next month already exists
    const { data: nextDraw } = await supabaseAdmin
      .from('draws')
      .select('id')
      .eq('draw_month', nextMonth.toISOString().split('T')[0])
      .maybeSingle()

    if (nextDraw) {
      await supabaseAdmin
        .from('draws')
        .update({ rollover_amount_pence: result.prizeBreakdown.rollover })
        .eq('id', nextDraw.id)
    } else {
      await supabaseAdmin
        .from('draws')
        .insert({
          draw_month: nextMonth.toISOString().split('T')[0],
          status: 'pending',
          rollover_amount_pence: result.prizeBreakdown.rollover,
          total_pool_pence: 0, // Will be updated by trigger/logic
          draw_mode: draw.draw_mode
        })
    }
  }
}
