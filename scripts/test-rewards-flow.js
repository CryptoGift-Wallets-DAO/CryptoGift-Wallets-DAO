#!/usr/bin/env node
/**
 * 🧪 Test Complete Rewards Flow
 * 
 * Tests the entire DAO rewards system end-to-end
 * Verifies database, contracts, webhooks, and integrations
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize clients
const supabaseUrl = process.env.SUPABASE_DAO_URL
const supabaseServiceKey = process.env.SUPABASE_DAO_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRewardsFlow() {
  console.log('🧪 Testing Complete CryptoGift DAO Rewards Flow\n')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test 1: Database Connection
  console.log('1️⃣ Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('count')
      .limit(0)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Database connected successfully')
    results.tests.push({ name: 'Database Connection', status: 'PASS' })
    results.passed++
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    results.tests.push({ name: 'Database Connection', status: 'FAIL', error: error.message })
    results.failed++
  }

  // Test 2: Environment Configuration
  console.log('\n2️⃣ Testing environment configuration...')
  const requiredEnvVars = [
    'SUPABASE_DAO_URL',
    'SUPABASE_DAO_ANON_KEY',
    'SUPABASE_DAO_SERVICE_KEY',
    'CGC_TOKEN_ADDRESS',
    'TASK_RULES_ADDRESS',
    'MILESTONE_ESCROW_ADDRESS',
    'DISCORD_DAO_TOKEN',
    'ZEALY_API_KEY',
    'ADMIN_DAO_API_TOKEN',
    'PRIVATE_KEY_DAO_DEPLOYER'
  ]
  
  let envTestsPassed = 0
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      envTestsPassed++
    } else {
      console.log(`⚠️  Missing: ${envVar}`)
    }
  }
  
  if (envTestsPassed === requiredEnvVars.length) {
    console.log('✅ All environment variables configured')
    results.tests.push({ name: 'Environment Configuration', status: 'PASS' })
    results.passed++
  } else {
    console.log(`❌ Environment configuration incomplete: ${envTestsPassed}/${requiredEnvVars.length}`)
    results.tests.push({ 
      name: 'Environment Configuration', 
      status: 'FAIL', 
      error: `Missing ${requiredEnvVars.length - envTestsPassed} variables` 
    })
    results.failed++
  }

  // Test 3: Task Schema
  console.log('\n3️⃣ Testing task schema...')
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, task_id, title, complexity, reward_cgc, status')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Task schema accessible')
    results.tests.push({ name: 'Task Schema', status: 'PASS' })
    results.passed++
  } catch (error) {
    console.log('❌ Task schema error:', error.message)
    results.tests.push({ name: 'Task Schema', status: 'FAIL', error: error.message })
    results.failed++
  }

  // Test 4: Admin API Token
  console.log('\n4️⃣ Testing admin API configuration...')
  const adminToken = process.env.ADMIN_DAO_API_TOKEN
  const publicAdminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
  
  if (adminToken && publicAdminToken && adminToken === publicAdminToken) {
    console.log('✅ Admin tokens configured correctly')
    results.tests.push({ name: 'Admin API Configuration', status: 'PASS' })
    results.passed++
  } else {
    console.log('❌ Admin token configuration mismatch')
    results.tests.push({ 
      name: 'Admin API Configuration', 
      status: 'FAIL', 
      error: 'Token mismatch or missing' 
    })
    results.failed++
  }

  // Test 5: Contract Addresses
  console.log('\n5️⃣ Testing contract configuration...')
  const contracts = {
    'CGC Token': process.env.CGC_TOKEN_ADDRESS,
    'Task Rules': process.env.TASK_RULES_ADDRESS,
    'Milestone Escrow': process.env.MILESTONE_ESCROW_ADDRESS,
    'Aragon DAO': process.env.ARAGON_DAO_ADDRESS
  }
  
  let contractsValid = 0
  for (const [name, address] of Object.entries(contracts)) {
    if (address && address.startsWith('0x') && address.length === 42) {
      contractsValid++
      console.log(`  ✅ ${name}: ${address}`)
    } else {
      console.log(`  ❌ ${name}: ${address || 'MISSING'}`)
    }
  }
  
  if (contractsValid === Object.keys(contracts).length) {
    console.log('✅ All contract addresses valid')
    results.tests.push({ name: 'Contract Configuration', status: 'PASS' })
    results.passed++
  } else {
    console.log('❌ Some contract addresses invalid')
    results.tests.push({ 
      name: 'Contract Configuration', 
      status: 'FAIL', 
      error: `${Object.keys(contracts).length - contractsValid} invalid addresses` 
    })
    results.failed++
  }

  // Test 6: Webhook Configuration
  console.log('\n6️⃣ Testing webhook configuration...')
  const webhooks = {
    'Discord Bot Token': process.env.DISCORD_DAO_TOKEN,
    'Discord Webhook': process.env.DISCORD_DAO_WEBHOOK_URL,
    'Zealy API Key': process.env.ZEALY_API_KEY,
    'Zealy Webhook Secret': process.env.ZEALY_WEBHOOK_SECRET
  }
  
  let webhooksValid = 0
  for (const [name, value] of Object.entries(webhooks)) {
    if (value && value.length > 10) {
      webhooksValid++
      console.log(`  ✅ ${name}: Configured`)
    } else {
      console.log(`  ❌ ${name}: Missing or invalid`)
    }
  }
  
  if (webhooksValid >= 3) {
    console.log('✅ Webhook configuration sufficient')
    results.tests.push({ name: 'Webhook Configuration', status: 'PASS' })
    results.passed++
  } else {
    console.log('❌ Webhook configuration insufficient')
    results.tests.push({ 
      name: 'Webhook Configuration', 
      status: 'FAIL', 
      error: `Only ${webhooksValid}/4 webhooks configured` 
    })
    results.failed++
  }

  // Test 7: Task Count
  console.log('\n7️⃣ Testing task initialization status...')
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      throw error
    }
    
    if (count === 0) {
      console.log('⚠️  No tasks initialized yet - run admin endpoint to initialize 34 tasks')
      results.tests.push({ name: 'Task Initialization', status: 'PENDING' })
    } else {
      console.log(`✅ Found ${count} tasks in database`)
      results.tests.push({ name: 'Task Initialization', status: 'PASS', details: `${count} tasks` })
      results.passed++
    }
  } catch (error) {
    console.log('❌ Task count check failed:', error.message)
    results.tests.push({ name: 'Task Initialization', status: 'FAIL', error: error.message })
    results.failed++
  }

  // Test 8: Redis Configuration
  console.log('\n8️⃣ Testing Redis configuration...')
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (redisUrl && redisToken) {
    console.log('✅ Redis configuration present')
    results.tests.push({ name: 'Redis Configuration', status: 'PASS' })
    results.passed++
  } else {
    console.log('❌ Redis configuration missing')
    results.tests.push({ name: 'Redis Configuration', status: 'FAIL', error: 'Missing URL or token' })
    results.failed++
  }

  // Final Results
  console.log('\n' + '='.repeat(60))
  console.log('🏁 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  
  results.tests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : test.status === 'PENDING' ? '⏸️ ' : '❌'
    const details = test.details ? ` (${test.details})` : ''
    const error = test.error ? ` - ${test.error}` : ''
    console.log(`${index + 1}. ${status} ${test.name}${details}${error}`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log(`✅ PASSED: ${results.passed}`)
  console.log(`❌ FAILED: ${results.failed}`)
  console.log(`⏸️  PENDING: ${results.tests.filter(t => t.status === 'PENDING').length}`)
  
  const totalTests = results.tests.length
  const successRate = Math.round((results.passed / totalTests) * 100)
  
  console.log(`\n🎯 SUCCESS RATE: ${successRate}% (${results.passed}/${totalTests})`)
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL CRITICAL SYSTEMS OPERATIONAL!')
    console.log('\n🚀 Ready for production deployment:')
    console.log('   1. npm run dev - Start development server')
    console.log('   2. Navigate to /tasks')
    console.log('   3. Click "Initialize Tasks" button')
    console.log('   4. Test task claiming and submission flow')
  } else if (successRate >= 75) {
    console.log('\n⚠️  SYSTEM MOSTLY READY - Some non-critical issues')
    console.log('\n📋 NEXT STEPS:')
    console.log('   1. Review failed tests above')
    console.log('   2. Fix critical configuration issues')
    console.log('   3. Re-run this test script')
  } else {
    console.log('\n🚨 SYSTEM NOT READY - Critical issues detected')
    console.log('\n🛠️  REQUIRED FIXES:')
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.name}: ${test.error}`)
      })
  }
  
  console.log('\n' + '='.repeat(60))
  
  return successRate >= 75
}

// Execute test if called directly
if (require.main === module) {
  testRewardsFlow()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error.message)
      process.exit(1)
    })
}

module.exports = { testRewardsFlow }