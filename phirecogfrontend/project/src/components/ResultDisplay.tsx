import { Download } from 'lucide-react';
import type { PhiRatioResult } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- UPDATE THE PROPS INTERFACE ---
interface Props {
  result: PhiRatioResult;
  annotatedImage: string | null; // This line fixes the error
}

const PHI = 1.618;

// --- UPDATE THE FUNCTION DEFINITION ---
export default function ResultDisplay({ result, annotatedImage }: Props) {
  const totalCloseness = result.reduce(
    (acc, curr) => acc + curr.closeness_to_phi,
    0
  );
  const averageScore = Math.round(totalCloseness / result.length);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('Facial Phi Ratio Analysis', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text(`Overall Phi Score: ${averageScore}%`, 105, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100); 
    doc.text(`(Based on closeness to the Golden Ratio: ${PHI.toFixed(3)})`, 105, 38, { 
      align: 'center' 
    });
    
    autoTable(doc, {
      startY: 50,
      head: [['Ratio Name', 'Calculated Ratio', 'Closeness to Phi (%)']],
      body: result.map(row => [
        row.name,
        row.ratio.toFixed(3),
        row.closeness_to_phi.toFixed(2)
      ]),
      headStyles: { fillColor: '#1e3a8a' },
      margin: { top: 50 }
    });

    // --- ADD THE IMAGE TO THE PDF ---
    if (annotatedImage) {
      try {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Analysis Points', 105, 20, { align: 'center' });
        
        const img = new Image();
        img.src = annotatedImage;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const aspectRatio = imgWidth / imgHeight;
        
        let newWidth = 180; // Page width - 30mm margin
        let newHeight = newWidth / aspectRatio;
        
        // Center it
        let x = (210 - newWidth) / 2;
        let y = 30;

        doc.addImage(annotatedImage, 'JPEG', x, y, newWidth, newHeight);
      } catch (pdfError) {
        console.error("Failed to add image to PDF:", pdfError);
      }
    }

    doc.save('Phi_Ratio_Analysis.pdf');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
      {/* Header and Score Donut Chart */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Phi Ratio Analysis</h3>
          <p className="text-slate-400">
            Comparing your facial ratios to the Golden Ratio ({PHI.toFixed(3)})
          </p>
        </div>
        
        <div className="flex-shrink-0 flex items-center justify-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-slate-700"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className="stroke-yellow-400"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${averageScore}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-2xl font-bold">{averageScore}%</span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-slate-400 text-sm">Overall</p>
              <p className="text-white text-lg font-semibold">Phi Score</p>
            </div>
        </div>
      </div>

      {/* Ratios List */}
      <div className="space-y-6">
        {result.map((metric) => (
          <div key={metric.name}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-white font-medium">{metric.name}</p>
              <p className="text-blue-300 text-lg font-semibold">
                {metric.ratio.toFixed(3)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-24 shrink-0">
                Closeness to Phi
              </span>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${metric.closeness_to_phi.toFixed(2)}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium w-12 text-right shrink-0">
                {metric.closeness_to_phi.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* --- THIS IS THE BLOCK THAT DISPLAYS THE IMAGE --- */}
      {annotatedImage && (
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h4 className="text-xl font-bold text-white mb-4 text-center">
            Analysis Points
          </h4>
          <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
            <img
              src={annotatedImage}
              alt="Analyzed Face with Landmarks"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Download Button Section */}
      <div className="mt-8 pt-6 border-t border-slate-700 text-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center gap-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          Download Results as PDF
        </button>
      </div>
    </div>
  );
}