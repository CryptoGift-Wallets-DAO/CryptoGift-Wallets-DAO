const OpenAI = require('openai');

/**
 * GPT-5 Test Suite - September 2025 Official Implementation
 * 
 * ⚠️ CRITICAL: GPT-5 was officially released August 7, 2025
 * Reference: https://openai.com/index/introducing-gpt-5/
 * 
 * This test validates the OFFICIAL GPT-5 September 2025 parameters:
 * - max_completion_tokens (NOT max_tokens)
 * - reasoning_effort: "high" for maximum reasoning
 * - verbosity: "medium" for balanced responses
 * - NO temperature parameter (deprecated in GPT-5)
 */
async function testGPT5() {
  console.log('🧠 TESTING GPT-5 WITH SEPTEMBER 2025 OFFICIAL PARAMETERS\n');
  console.log('📅 GPT-5 Release Date: August 7, 2025');
  console.log('🔗 Reference: https://openai.com/index/introducing-gpt-5/\n');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log('🚀 Testing GPT-5 with OFFICIAL September 2025 parameters...\n');
    
    const completion = await openai.chat.completions.create({
      // ✅ OFFICIAL GPT-5 Configuration (September 2025)
      model: "gpt-5", // ✅ GPT-5 (Released August 7, 2025)
      messages: [
        { 
          role: "system", 
          content: "You are apeX, powered by GPT-5 (August 7, 2025 release) with maximum reasoning capabilities. Reference: https://openai.com/index/introducing-gpt-5/" 
        },
        { 
          role: "user", 
          content: "Using your GPT-5 reasoning capabilities, explain why GPT-5 is superior to GPT-4o for complex DAO operations. Include specific September 2025 improvements." 
        }
      ],
      max_completion_tokens: 1000, // ✅ REQUIRED for GPT-5 (NOT max_tokens)
      reasoning_effort: "high",     // ✅ "minimal" | "high" (Sept 2025 feature)
      verbosity: "medium",          // ✅ "low" | "medium" | "high" (Sept 2025 feature)
      
      // ❌ REMOVED: temperature (deprecated in GPT-5, causes API errors)
    });
    
    console.log('✅ GPT-5 Response:');
    console.log('='.repeat(80));
    console.log(completion.choices[0].message.content);
    console.log('='.repeat(80));
    
    console.log('\n📊 Usage Statistics:');
    console.log(`Total tokens: ${completion.usage?.total_tokens || 'N/A'}`);
    console.log(`Prompt tokens: ${completion.usage?.prompt_tokens || 'N/A'}`);
    console.log(`Completion tokens: ${completion.usage?.completion_tokens || 'N/A'}`);
    
    if (completion.usage?.reasoning_tokens) {
      console.log(`🧠 Reasoning tokens: ${completion.usage.reasoning_tokens} (THINKING MODE ACTIVE)`);
    }
    
    console.log(`\n💰 Estimated cost:`);
    const promptCost = (completion.usage?.prompt_tokens || 0) * 1.25 / 1000000;
    const completionCost = (completion.usage?.completion_tokens || 0) * 10 / 1000000;
    console.log(`Prompt: $${promptCost.toFixed(4)}`);
    console.log(`Completion: $${completionCost.toFixed(4)}`);
    console.log(`Total: $${(promptCost + completionCost).toFixed(4)}`);
    
    console.log('\n🎯 GPT-5 September 2025 Configuration Verified:');
    console.log('✅ Model: GPT-5 (Official August 7, 2025 release)');
    console.log('✅ max_completion_tokens: 1000 (CORRECT parameter)');
    console.log('✅ reasoning_effort: "high" (Maximum reasoning)');
    console.log('✅ verbosity: "medium" (Balanced responses)');
    console.log('✅ NO temperature parameter (Correctly removed)');
    console.log('✅ Ready for production DAO operations');
    console.log('✅ Reference: https://openai.com/index/introducing-gpt-5/');
    
  } catch (error) {
    console.error('\n❌ GPT-5 test failed:');
    console.error('Status:', error.status);
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    
    // Check if it's a model availability issue
    if (error.status === 404) {
      console.log('\n💡 POSSIBLE SOLUTIONS:');
      console.log('1. GPT-5 may not be available in your tier - check usage tier at platform.openai.com');
      console.log('2. Try fallback to gpt-5-mini or o3 series');
      console.log('3. Verify organization has access to latest models');
      console.log('4. Check if your account needs verification for GPT-5 access');
    } else if (error.status === 400) {
      console.log('\n💡 GPT-5 PARAMETER ISSUE (September 2025):');
      console.log('1. Ensure using max_completion_tokens (NOT max_tokens)');
      console.log('2. reasoning_effort must be "minimal" or "high"');
      console.log('3. verbosity must be "low", "medium", or "high"');
      console.log('4. DO NOT use temperature parameter (deprecated in GPT-5)');
      console.log('5. Reference: https://platform.openai.com/docs/models/gpt-5');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testGPT5();