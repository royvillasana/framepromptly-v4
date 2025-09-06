class d{constructor(t={}){this.results={timestamp:new Date().toISOString(),frameworks:[],totalTools:0,testedTools:0,successfulPrompts:0,failedPrompts:0,totalExecutions:0,successfulExecutions:0,failedExecutions:0,errors:[],executionTime:0},this.testProjectId="ai-stress-test-"+Date.now(),this.testFrameworks=[],this.options={useRealAI:t.useRealAI!==!1,aiDelayMs:t.aiDelayMs||2e3,maxConcurrentAI:t.maxConcurrentAI||1,simulateFailures:t.simulateFailures!==!1,aiExecutor:t.aiExecutor,...t},this.aiRequestQueue=[],this.activeAIRequests=0}async initialize(){console.log("🎯 UX AI Stress Tester initialized")}setFrameworks(t){this.testFrameworks=t,console.log(`📋 Loaded ${t.length} frameworks for testing`)}async runComprehensiveTest(){console.log("🚀 Starting Comprehensive UX Tools AI Stress Test");const t=Date.now();try{if(!this.testFrameworks||this.testFrameworks.length===0)throw new Error("No frameworks loaded. Call setFrameworks() first.");for(let s=0;s<this.testFrameworks.length;s++){const e=this.testFrameworks[s];console.log(`
📋 Testing Framework ${s+1}/${this.testFrameworks.length}: ${e.name}`);const o=await this.testFramework(e);this.results.frameworks.push(o),await this.delay(500)}return this.results.executionTime=Date.now()-t,console.log(`
✅ Comprehensive Test Complete!`),this.printSummary(),this.results}catch(s){return console.error("❌ Test failed:",s),this.results.errors.push({type:"global",message:s.message,timestamp:new Date().toISOString()}),this.results}}printSummary(){console.log(`
📊 TEST RESULTS SUMMARY`),console.log(`${"=".repeat(50)}`),console.log(`Total Frameworks: ${this.results.frameworks.length}`),console.log(`Total Tools: ${this.results.totalTools}`),console.log(`Tested Tools: ${this.results.testedTools}`),console.log(`Successful Prompts: ${this.results.successfulPrompts}`),console.log(`Failed Prompts: ${this.results.failedPrompts}`),console.log(`Successful AI Executions: ${this.results.successfulExecutions}`),console.log(`Failed AI Executions: ${this.results.failedExecutions}`),console.log(`Total Execution Time: ${this.results.executionTime}ms`),console.log(`Success Rate: ${(this.results.successfulPrompts/this.results.testedTools*100).toFixed(1)}%`)}async testFramework(t){const s={id:t.id,name:t.name,description:t.description,stages:[],totalTools:0,testedTools:0,successfulPrompts:0,failedPrompts:0,successfulExecutions:0,failedExecutions:0,errors:[]};try{for(let e=0;e<t.stages.length;e++){const o=t.stages[e];console.log(`  📌 Testing Stage ${e+1}/${t.stages.length}: ${o.name}`);const r=await this.testStage(t,o);s.stages.push(r),s.totalTools+=r.totalTools,s.testedTools+=r.testedTools,s.successfulPrompts+=r.successfulPrompts,s.failedPrompts+=r.failedPrompts,s.successfulExecutions+=r.successfulExecutions,s.failedExecutions+=r.failedExecutions,s.errors.push(...r.errors),await this.delay(200)}}catch(e){s.errors.push({type:"framework",framework:t.name,message:e.message,timestamp:new Date().toISOString()})}return this.results.totalTools+=s.totalTools,this.results.testedTools+=s.testedTools,this.results.successfulPrompts+=s.successfulPrompts,this.results.failedPrompts+=s.failedPrompts,this.results.successfulExecutions+=s.successfulExecutions,this.results.failedExecutions+=s.failedExecutions,this.results.errors.push(...s.errors),s}async testStage(t,s){var o;const e={id:s.id,name:s.name,description:s.description,tools:[],totalTools:((o=s.tools)==null?void 0:o.length)||0,testedTools:0,successfulPrompts:0,failedPrompts:0,successfulExecutions:0,failedExecutions:0,errors:[]};try{if(!s.tools||s.tools.length===0)return e.errors.push({type:"stage",message:`No tools found in stage ${s.name}`,timestamp:new Date().toISOString()}),e;for(let r=0;r<s.tools.length;r++){const a=s.tools[r];console.log(`    🔧 Testing Tool ${r+1}/${s.tools.length}: ${a.name}`);const i=await this.testTool(t,s,a);e.tools.push(i),i.tested&&(e.testedTools++,i.promptGenerated?e.successfulPrompts++:e.failedPrompts++,i.aiExecuted?e.successfulExecutions++:i.promptGenerated&&e.failedExecutions++),e.errors.push(...i.errors),await this.delay(100)}}catch(r){e.errors.push({type:"stage",stage:s.name,message:r.message,timestamp:new Date().toISOString()})}return e}async testTool(t,s,e){const o={id:e.id,name:e.name,description:e.description,category:e.category,characteristics:e.characteristics,tested:!1,promptGenerated:!1,aiExecuted:!1,generatedPrompt:null,aiResponse:null,executionTime:0,errors:[]},r=Date.now();try{const a=await this.generatePromptForTool(t,s,e);if(a.success){o.promptGenerated=!0,o.generatedPrompt=a.prompt,console.log(`      ✅ Prompt generated (${a.prompt.length} chars)`);let i;this.options.useRealAI&&this.options.aiExecutor?(console.log("      🤖 Using external AI executor..."),i=await this.options.aiExecutor(a),i||(i=await this.simulateAIExecution(a))):i=await this.simulateAIExecution(a),i.success?(o.aiExecuted=!0,o.aiResponse=i.response,console.log("      🤖 AI execution simulated successfully")):(o.errors.push({type:"execution",tool:e.name,message:`AI execution failed: ${i.error}`,timestamp:new Date().toISOString()}),console.log(`      ❌ AI execution failed: ${i.error}`))}else o.errors.push({type:"prompt_generation",tool:e.name,message:`Prompt generation failed: ${a.error}`,timestamp:new Date().toISOString()}),console.log(`      ❌ Prompt generation failed: ${a.error}`);o.tested=!0,o.executionTime=Date.now()-r}catch(a){o.errors.push({type:"tool_test",tool:e.name,message:`Tool test failed: ${a.message}`,timestamp:new Date().toISOString()}),console.log(`      💥 Tool test exception: ${a.message}`)}return o}async generatePromptForTool(t,s,e){try{const o=this.generateMockVariables(t,s,e);return o.toolName=e.name,{success:!0,prompt:this.generatePromptContent(t,s,e,o),variables:o}}catch(o){return{success:!1,error:o.message}}}async executePromptWithAI(t){var s,e;try{this.options.aiDelayMs>0&&await this.delay(this.options.aiDelayMs),console.log("      🤖 Executing real AI prompt...");const o=await fetch("/api/generate-ai-prompt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({promptContent:t.prompt,variables:t.variables||{},projectId:this.testProjectId,frameworkName:"AI Stress Test",stageName:"Validation",toolName:((s=t.variables)==null?void 0:s.toolName)||"Unknown Tool",knowledgeContext:null})});if(!o.ok){const a=await o.text();return console.log(`      ❌ AI execution failed: ${o.status} ${a}`),{success:!1,error:`HTTP ${o.status}: ${a}`}}const r=await o.json();return r!=null&&r.success?(console.log(`      ✅ AI execution successful (${((e=r.aiResponse)==null?void 0:e.length)||0} chars)`),{success:!0,response:r.aiResponse||"No response content"}):(console.log(`      ❌ AI generation failed: ${(r==null?void 0:r.error)||"Unknown error"}`),{success:!1,error:(r==null?void 0:r.error)||"Unknown error"})}catch(o){return console.log(`      ❌ AI execution error: ${o.message}`),{success:!1,error:o.message}}}async simulateAIExecution(t){var s;try{await this.delay(Math.random()*1e3+500);const e=`[SIMULATED] Generated comprehensive UX deliverable for ${((s=t.variables)==null?void 0:s.toolName)||"tool"} using professional methodology. This simulated response demonstrates successful prompt processing.

Key deliverables:
1. Detailed methodology and approach
2. Step-by-step implementation guide  
3. Success metrics and validation criteria
4. Next steps and recommendations

[Simulated content length: ${Math.floor(Math.random()*2e3+1e3)} words]`;return this.options.simulateFailures&&Math.random()<.05?{success:!1,error:"Simulated AI service timeout"}:{success:!0,response:e}}catch(e){return{success:!1,error:e.message}}}generateMockVariables(t,s,e){var r;const o={projectName:"HealthTech Platform UX Optimization",targetUsers:"Healthcare professionals and patients",businessGoals:`Improve user experience for ${e.name} using ${t.name} methodology`,timeframe:"3-6 months",teamSize:"5-8 team members",budget:"$50,000 - $100,000"};switch((r=e.category)==null?void 0:r.toLowerCase()){case"research":return{...o,researchQuestions:`How can we optimize ${e.name} for healthcare workflows?`,sampleSize:"15-25 participants",researchMethods:"Interviews, surveys, observation",timeline:"4-6 weeks"};case"analysis":return{...o,dataPoints:"User feedback, analytics, behavioral data",analysisScope:"Complete user journey",keyMetrics:"Task completion, satisfaction, efficiency"};case"design":return{...o,designConstraints:"Accessibility, mobile-first, HIPAA compliance",designPrinciples:"User-centered, inclusive, efficient",deliverables:"Wireframes, prototypes, design system"};case"testing":return{...o,testingGoals:"Validate usability and functionality",successCriteria:"Task completion >90%, satisfaction >4.5/5",testingMethods:"Moderated sessions, A/B testing, analytics"};default:return{...o,scope:`${e.category} activities for ${s.name} phase`,deliverables:`Professional ${e.name} outputs`}}}generatePromptContent(t,s,e,o){var r,a,i,n,l,c;return`# AI Stress Test: ${e.name} Prompt

## Framework: ${t.name}
**Description:** ${t.description}

## Stage: ${s.name}
**Description:** ${s.description}

## Tool: ${e.name}
**Description:** ${e.description}
**Category:** ${e.category}

### Tool Characteristics
- **Effort Required:** ${((r=e.characteristics)==null?void 0:r.effort)||"Medium"}
- **Expertise Level:** ${((a=e.characteristics)==null?void 0:a.expertise)||"Intermediate"}
- **Resources Needed:** ${((n=(i=e.characteristics)==null?void 0:i.resources)==null?void 0:n.join(", "))||"Standard UX tools"}
- **Expected Output:** ${((l=e.characteristics)==null?void 0:l.output)||"Professional deliverable"}
- **Best Used When:** ${((c=e.characteristics)==null?void 0:c.when)||"During stage activities"}

### Project Context
${Object.entries(o).map(([u,m])=>`- **${u}:** ${m}`).join(`
`)}

### Task Request
Create a comprehensive ${e.name} deliverable using ${t.name} methodology for the ${s.name} stage. Your output should be:

1. **Professional Quality:** Ready for immediate use by UX practitioners
2. **Contextually Relevant:** Tailored to healthcare/technology domain
3. **Actionable:** Include specific steps, methods, and recommendations
4. **Measurable:** Define success criteria and validation methods
5. **Comprehensive:** Cover all aspects typically expected for ${e.name}

### Specific Deliverables Required
- Detailed methodology and approach
- Step-by-step implementation guide
- Templates, frameworks, or structured outputs
- Success metrics and validation criteria
- Next steps and recommendations
- Integration with ${t.name} principles

### Quality Standards
- Industry-standard formatting and structure
- Clear, professional language
- Evidence-based recommendations
- Practical implementation guidance
- Consideration of constraints and limitations

Generate a complete, professional-grade ${e.name} deliverable that demonstrates mastery of ${t.name} methodology and provides immediate practical value.

---
*Generated by FramePromptly AI Stress Test - ${new Date().toISOString()}*`}async delay(t){return new Promise(s=>setTimeout(s,t))}exportResults(){return{timestamp:this.results.timestamp,summary:{totalFrameworks:this.results.frameworks.length,totalTools:this.results.totalTools,testedTools:this.results.testedTools,successRate:this.results.testedTools>0?(this.results.successfulPrompts/this.results.testedTools*100).toFixed(1):0,executionTime:this.results.executionTime},detailed:this.results}}}typeof window<"u"&&(window.UXToolsStressTester=d);export{d as default};
