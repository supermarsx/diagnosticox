import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, TrendingUp, TrendingDown, Lightbulb, Target } from 'lucide-react';

interface BayesianCalculatorPageProps {
  user: any;
}

export default function BayesianCalculatorPage({ user }: BayesianCalculatorPageProps) {
  const navigate = useNavigate();
  
  const [pretestProb, setPretestProb] = useState(0.25);
  const [sensitivity, setSensitivity] = useState(0.95);
  const [specificity, setSpecificity] = useState(0.88);
  const [results, setResults] = useState<any>(null);

  const calculateBayesian = () => {
    // Calculate likelihood ratios
    const lrPositive = sensitivity / (1 - specificity);
    const lrNegative = (1 - sensitivity) / specificity;

    // Calculate post-test odds
    const pretestOdds = pretestProb / (1 - pretestProb);
    const posttestOddsPositive = pretestOdds * lrPositive;
    const posttestOddsNegative = pretestOdds * lrNegative;

    // Convert back to probability
    const posttestProbPositive = posttestOddsPositive / (1 + posttestOddsPositive);
    const posttestProbNegative = posttestOddsNegative / (1 + posttestOddsNegative);

    setResults({
      lrPositive,
      lrNegative,
      posttestProbPositive,
      posttestProbNegative,
      pretestOdds,
      posttestOddsPositive,
      posttestOddsNegative,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Glassmorphism Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="glass-card-strong p-3 rounded-2xl">
                <Calculator className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bayesian Probability Calculator
                </h1>
                <p className="text-sm text-gray-600">Calculate post-test probabilities for diagnostic tests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="glass-card p-6 gradient-overlay-primary hover-lift">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Test Parameters
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Pretest Probability */}
              <div className="glass-card-subtle p-4 rounded-xl">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Pretest Probability: <span className="text-indigo-600">{(pretestProb * 100).toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={pretestProb}
                  onChange={(e) => setPretestProb(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${pretestProb * 100}%, rgba(200, 200, 200, 0.3) ${pretestProb * 100}%, rgba(200, 200, 200, 0.3) 100%)`
                  }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Probability of disease before test based on clinical assessment
                </p>
              </div>

              {/* Sensitivity */}
              <div className="glass-card-subtle p-4 rounded-xl">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Sensitivity: <span className="text-green-600">{(sensitivity * 100).toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${sensitivity * 100}%, rgba(200, 200, 200, 0.3) ${sensitivity * 100}%, rgba(200, 200, 200, 0.3) 100%)`
                  }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  True positive rate (positive when disease present)
                </p>
              </div>

              {/* Specificity */}
              <div className="glass-card-subtle p-4 rounded-xl">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Specificity: <span className="text-blue-600">{(specificity * 100).toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={specificity}
                  onChange={(e) => setSpecificity(parseFloat(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${specificity * 100}%, rgba(200, 200, 200, 0.3) ${specificity * 100}%, rgba(200, 200, 200, 0.3) 100%)`
                  }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  True negative rate (negative when disease absent)
                </p>
              </div>

              <button
                onClick={calculateBayesian}
                className="w-full glass-button-primary py-3.5 flex items-center justify-center gap-2 font-semibold"
              >
                <Calculator className="h-5 w-5" />
                Calculate Post-Test Probabilities
              </button>
            </div>

            {/* Example Scenarios */}
            <div className="mt-6 glass-card-subtle p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-bold text-gray-900">Example Scenarios:</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPretestProb(0.25);
                    setSensitivity(0.95);
                    setSpecificity(0.88);
                  }}
                  className="glass-button text-sm w-full text-left"
                >
                  TSH for Hypothyroidism (Sensitivity 95%, Specificity 88%)
                </button>
                <button
                  onClick={() => {
                    setPretestProb(0.20);
                    setSensitivity(0.92);
                    setSpecificity(0.85);
                  }}
                  className="glass-button text-sm w-full text-left"
                >
                  Hemoglobin for Anemia (Sensitivity 92%, Specificity 85%)
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="glass-card p-6 gradient-overlay-secondary hover-lift">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Calculation Results
            </h3>
            
            {!results ? (
              <div className="text-center py-16">
                <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">Click Calculate to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Likelihood Ratios */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Likelihood Ratios</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card-subtle p-4 rounded-xl border-2 border-green-200/50">
                      <p className="text-sm text-green-700 font-medium mb-1">LR+ (Positive)</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {results.lrPositive.toFixed(2)}
                      </p>
                    </div>
                    <div className="glass-card-subtle p-4 rounded-xl border-2 border-red-200/50">
                      <p className="text-sm text-red-700 font-medium mb-1">LR- (Negative)</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                        {results.lrNegative.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post-Test Probabilities */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Post-Test Probabilities</h4>
                  
                  {/* If Positive */}
                  <div className="mb-4 glass-card-subtle border-2 border-green-300/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-gray-900">If Test Positive</span>
                      </div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {(results.posttestProbPositive * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="glass-card-subtle rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${results.posttestProbPositive * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      Change: {((results.posttestProbPositive - pretestProb) * 100).toFixed(1)}% 
                      {results.posttestProbPositive > pretestProb ? ' increase' : ' decrease'}
                    </p>
                  </div>

                  {/* If Negative */}
                  <div className="glass-card-subtle border-2 border-red-300/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <span className="font-bold text-gray-900">If Test Negative</span>
                      </div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                        {(results.posttestProbNegative * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="glass-card-subtle rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
                        style={{ width: `${results.posttestProbNegative * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      Change: {((results.posttestProbNegative - pretestProb) * 100).toFixed(1)}% 
                      {results.posttestProbNegative > pretestProb ? ' increase' : ' decrease'}
                    </p>
                  </div>
                </div>

                {/* Clinical Interpretation */}
                <div className="glass-badge-info p-4 rounded-xl">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Clinical Interpretation
                  </h4>
                  <p className="text-sm">
                    {results.posttestProbPositive > 0.7 
                      ? 'Positive test significantly increases probability - consider confirmatory testing or treatment'
                      : results.posttestProbNegative < 0.1
                      ? 'Negative test effectively rules out condition - consider alternative diagnoses'
                      : 'Test has moderate diagnostic value - may require additional testing'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Understanding Bayesian Reasoning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-subtle p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Pretest Probability</h4>
              <p className="text-sm text-gray-700">Your clinical estimate of disease likelihood before testing, based on history, exam, and epidemiology.</p>
            </div>
            <div className="glass-card-subtle p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Likelihood Ratios</h4>
              <p className="text-sm text-gray-700">How much a positive (LR+) or negative (LR-) test result changes the odds of disease. LR+ &gt; 10 and LR- &lt; 0.1 are highly informative.</p>
            </div>
            <div className="glass-card-subtle p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Post-Test Probability</h4>
              <p className="text-sm text-gray-700">Updated probability after test result. Guides whether to rule in/out disease or order additional tests.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
