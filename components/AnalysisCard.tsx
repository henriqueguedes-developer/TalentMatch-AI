
import React from 'react';
import { AnalysisResult } from '../types';
import MatchGauge from './MatchGauge';
import { CheckCircle, AlertTriangle, Briefcase, Users, Lightbulb, GraduationCap } from 'lucide-react';

interface AnalysisCardProps {
  result: AnalysisResult;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-geek-border overflow-hidden">
      {/* Header Section */}
      <div className="p-8 border-b border-geek-border">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-geek-dark mb-4">Analysis Summary</h3>
            <p className="text-geek-text text-base leading-relaxed mb-6">{result.summary}</p>
            
            <div className="flex items-center gap-4">
               <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${
                 result.recommendation === 'High Priority' ? 'bg-green-50 text-green-700 border-green-200' :
                 result.recommendation === 'Consider' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                 'bg-red-50 text-red-700 border-red-200'
               }`}>
                 {result.recommendation.toUpperCase()}
               </span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
             <MatchGauge score={result.overallScore} label="Adherence" size={180} />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Technical Fit */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-geek-border">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <div className="bg-geek-blue/10 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-geek-blue" />
                  </div>
                  <h4 className="font-bold text-geek-dark text-lg">Technical Fit</h4>
              </div>
              <span className="font-bold text-2xl text-geek-dark">{result.technicalFit}%</span>
           </div>
           
           <div className="w-full bg-geek-gray rounded-full h-2 mb-8">
              <div className="bg-geek-blue h-2 rounded-full" style={{ width: `${result.technicalFit}%` }}></div>
           </div>

           <h5 className="text-sm font-bold text-green-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
             <CheckCircle className="w-4 h-4" /> Strengths
           </h5>
           <ul className="space-y-3">
             {result.strengths.map((s, i) => (
               <li key={i} className="text-sm text-geek-text pl-4 border-l-2 border-green-300 py-0.5">{s}</li>
             ))}
           </ul>
        </div>

        {/* Cultural Fit */}
        <div className="p-8">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                     <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-geek-dark text-lg">Cultural Fit</h4>
              </div>
              <span className="font-bold text-2xl text-geek-dark">{result.culturalFit}%</span>
           </div>
           
           <div className="w-full bg-geek-gray rounded-full h-2 mb-8">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${result.culturalFit}%` }}></div>
           </div>

           <h5 className="text-sm font-bold text-amber-600 mb-4 flex items-center gap-2 uppercase tracking-wide">
             <AlertTriangle className="w-4 h-4" /> Areas for Improvement
           </h5>
           <ul className="space-y-3">
             {result.weaknesses.map((w, i) => (
               <li key={i} className="text-sm text-geek-text pl-4 border-l-2 border-amber-300 py-0.5">{w}</li>
             ))}
           </ul>
        </div>
      </div>

      {/* Improvement Tips Section */}
      {result.improvementTips && result.improvementTips.length > 0 && (
        <div className="p-8 bg-gradient-to-br from-geek-dark to-[#10243e] text-white">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h4 className="font-bold text-xl">Professional Development Plan</h4>
                <p className="text-gray-300 text-sm">Customized tips to reach 100% adherence</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             {result.improvementTips.map((tip, idx) => (
               <div key={idx} className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="mt-1 bg-geek-blue rounded-full p-1 flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-100 leading-relaxed">{tip}</span>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;