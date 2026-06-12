import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-background text-on-surface min-h-screen antialiased">

      {/* Navbar */}
      <header className="bg-background sticky top-0 border-b border-outline-variant z-50">
        <div className="flex justify-between items-center w-full px-lg py-md max-w-7xl mx-auto">
          <div className="flex items-center gap-md">
            <Link className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight" to="/">CodeRoom</Link>
            <nav className="hidden md:flex items-center gap-lg ml-xl">
              <a className="font-title-md text-title-md text-primary font-bold border-b-2 border-primary pb-sm" href="#">Features</a>
              <a className="font-title-md text-title-md text-on-surface-variant pb-sm border-b-2 border-transparent hover:text-primary transition-colors" href="#">Solutions</a>
              <a className="font-title-md text-title-md text-on-surface-variant pb-sm border-b-2 border-transparent hover:text-primary transition-colors" href="#">Pricing</a>
              <a className="font-title-md text-title-md text-on-surface-variant pb-sm border-b-2 border-transparent hover:text-primary transition-colors" href="#">Resources</a>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <Link className="hidden md:block font-title-md text-title-md text-on-surface-variant hover:text-primary transition-colors" to="/login">Sign In</Link>
            <Link className="bg-primary text-on-primary px-md py-sm rounded-lg font-title-md text-title-md hover:bg-primary-fixed-dim transition-colors" to="/register">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-2xl pb-xl px-lg md:pt-[80px] md:pb-[64px] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">

            {/* Left */}
            <div className="flex flex-col gap-lg z-10">
              <div className="inline-flex items-center gap-sm bg-surface-container/50 border border-outline-variant/50 rounded-full px-md py-sm w-fit">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <span className="font-label-sm text-label-sm text-primary">Now featuring AI-Assisted Grading</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight">
                Technical Interviews,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed-dim">Reimagined.</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[500px]">
                Conduct seamless live coding interviews with a powerful IDE, AI-driven hints, and instant session replays. Identify top engineering talent faster and with deeper insight.
              </p>
              <div className="flex flex-col sm:flex-row gap-md pt-sm">
                <Link className="bg-primary text-on-primary px-lg py-md rounded-lg font-title-md text-title-md text-center hover:bg-primary-fixed-dim transition-colors shadow-[0_0_20px_rgba(173,198,255,0.2)]" to="/register">Get Started Free</Link>
                <Link className="bg-transparent border border-outline-variant text-on-surface px-lg py-md rounded-lg font-title-md text-title-md text-center hover:bg-surface-variant transition-colors flex items-center justify-center gap-sm" to="/login">
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right - IDE Mockup */}
            <div className="relative z-10 w-full h-[400px] md:h-[500px] rounded-xl border border-outline-variant bg-surface-container overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-md py-sm bg-surface-container-high border-b border-outline-variant">
                <div className="flex items-center gap-sm">
                  <div className="flex gap-[6px]">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  </div>
                  <span className="ml-sm font-label-sm text-label-sm text-on-surface-variant">interview-session.js</span>
                </div>
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">play_arrow</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">more_horiz</span>
                </div>
              </div>
              <div className="flex-1 p-md relative overflow-hidden bg-surface-dim font-code-sm text-code-sm text-on-surface-variant leading-loose">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-surface-container border-r border-outline-variant/30 flex flex-col items-end pr-2 py-md text-outline">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}>{n}</div>)}
                </div>
                <div className="pl-xl">
                  <div className="text-[#c678dd]">function <span className="text-[#61afef]">findTwoSum</span>(<span className="text-[#e5c07b]">nums</span>, <span className="text-[#e5c07b]">target</span>) {'{'}</div>
                  <div className="pl-md text-[#5c6370]">{'  // Use a hash map for O(n) time complexity'}</div>
                  <div className="pl-md"><span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">map</span> = <span className="text-[#c678dd]">new</span> <span className="text-[#e5c07b]">Map</span>();</div>
                  <div className="pl-md"><span className="text-[#c678dd]">for</span> (<span className="text-[#c678dd]">let</span> <span className="text-[#e5c07b]">i</span> = <span className="text-[#d19a66]">0</span>; <span className="text-[#e5c07b]">i</span> &lt; <span className="text-[#e5c07b]">nums</span>.<span className="text-[#e06c75]">length</span>; <span className="text-[#e5c07b]">i</span>++) {'{'}</div>
                  <div className="pl-lg"><span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">complement</span> = <span className="text-[#e5c07b]">target</span> - <span className="text-[#e5c07b]">nums</span>[<span className="text-[#e5c07b]">i</span>];</div>
                  <div className="pl-lg"><span className="text-[#c678dd]">if</span> (<span className="text-[#e5c07b]">map</span>.<span className="text-[#61afef]">has</span>(<span className="text-[#e5c07b]">complement</span>)) {'{'}</div>
                  <div className="pl-xl"><span className="text-[#c678dd]">return</span> [<span className="text-[#e5c07b]">map</span>.<span className="text-[#61afef]">get</span>(<span className="text-[#e5c07b]">complement</span>), <span className="text-[#e5c07b]">i</span>];</div>
                  <div className="pl-lg">{'}'}</div>
                  <div className="pl-lg"><span className="text-[#e5c07b]">map</span>.<span className="text-[#61afef]">set</span>(<span className="text-[#e5c07b]">nums</span>[<span className="text-[#e5c07b]">i</span>], <span className="text-[#e5c07b]">i</span>);</div>
                  <div className="pl-md">{'}'}</div>
                  <div className="pl-md"><span className="text-[#c678dd]">return</span> [];</div>
                  <div>{'}'}</div>
                </div>
                <div className="absolute bottom-md right-md bg-surface-container-high border border-primary/30 rounded-lg p-sm flex items-start gap-sm shadow-lg max-w-[280px]">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]">auto_awesome</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-primary mb-xs">AI Hint Available</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant text-[10px] leading-tight">Candidate is struggling with Map syntax. Suggest reviewing Map.prototype.set().</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-lg border-y border-outline-variant bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-lg">
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">Trusted by engineering teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              {[{icon:'cloud',name:'CloudCorp'},{icon:'database',name:'DataFlow'},{icon:'api',name:'APIStack'},{icon:'security',name:'SecureNet'},{icon:'token',name:'BlockChain Inc'}].map(({icon,name}) => (
                <div key={name} className="flex items-center gap-xs font-title-md text-title-md font-bold">
                  <span className="material-symbols-outlined">{icon}</span> {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-2xl px-lg max-w-7xl mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-display-lg text-display-lg text-on-surface mb-sm">Everything you need to evaluate talent.</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Built for modern engineering teams who demand precision and a flawless candidate experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">

            {/* Feature 1 */}
            <div className="md:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors"></div>
              <div className="z-10 mb-xl">
                <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-md border border-outline-variant">
                  <span className="material-symbols-outlined text-primary">code_blocks</span>
                </div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface mb-xs">Live Collaborative Editor</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Real-time coding in 20+ languages with Monaco-based power. Experience latency-free typing, autocompletion, and multi-cursor support just like your local IDE.</p>
              </div>
              <div className="mt-auto border border-outline-variant rounded-lg bg-surface-dim p-sm flex gap-sm overflow-hidden opacity-80 h-32 relative">
                <div className="flex flex-col gap-xs w-full">
                  <div className="h-2 w-1/3 bg-outline/20 rounded"></div>
                  <div className="h-2 w-1/2 bg-outline/20 rounded ml-sm"></div>
                  <div className="h-2 w-1/4 bg-primary/40 rounded ml-md"></div>
                  <div className="h-2 w-2/3 bg-outline/20 rounded ml-sm"></div>
                </div>
                <div className="absolute right-md top-1/2 -translate-y-1/2 flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface-dim font-label-sm text-on-primary">JS</div>
                  <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center border-2 border-surface-dim font-label-sm text-on-tertiary">JD</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] translate-y-1/4 translate-x-1/4 group-hover:bg-secondary/20 transition-colors"></div>
              <div className="z-10 mb-xl">
                <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-md border border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">smart_toy</span>
                </div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface mb-xs">AI-Powered Assistance</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Smart hints and analysis to keep candidates moving without giving away the answer.</p>
              </div>
              <div className="mt-auto border border-outline-variant rounded-lg bg-surface-dim p-md opacity-80">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary text-[16px]">lightbulb</span>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-secondary/30 rounded"></div>
                    <div className="h-2 w-4/5 bg-secondary/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute left-1/2 top-1/2 w-[500px] h-[100px] bg-tertiary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="z-10 md:w-1/2">
                <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-md border border-outline-variant">
                  <span className="material-symbols-outlined text-tertiary">history</span>
                </div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface mb-xs">Instant Session Replay</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Review every keystroke and decision with high-fidelity playback. Scrub through the timeline to see exactly how a candidate approached complex problems.</p>
              </div>
              <div className="z-10 md:w-1/2 w-full border border-outline-variant rounded-lg bg-surface-dim p-md flex flex-col gap-sm opacity-90">
                <div className="flex items-center gap-md">
                  <button className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </button>
                  <div className="flex-1 h-1 bg-outline-variant rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-tertiary rounded-full"></div>
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-tertiary rounded-full shadow-[0_0_8px_rgba(255,183,134,0.5)] cursor-pointer"></div>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">14:22 / 45:00</span>
                </div>
                <div className="flex gap-xs ml-12 pt-xs">
                  <div className="w-1 h-3 bg-error/50 rounded-full"></div>
                  <div className="w-1 h-3 bg-primary/50 rounded-full ml-4"></div>
                  <div className="w-1 h-3 bg-[#10B981]/50 rounded-full ml-12"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant mt-xl">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-lg py-xl max-w-7xl mx-auto gap-lg">
          <div className="font-title-md text-title-md font-bold text-on-surface">CodeRoom</div>
          <nav className="flex flex-wrap justify-center gap-md font-body-md text-body-md">
            {['Privacy Policy','Terms of Service','Security','Contact'].map(item => (
              <a key={item} href="#" className="text-on-surface-variant hover:text-on-surface transition-colors">{item}</a>
            ))}
          </nav>
          <div className="font-body-md text-body-md text-on-surface-variant">© 2024 CodeRoom Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}