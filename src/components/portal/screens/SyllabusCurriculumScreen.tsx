'use client';

import React from 'react';
import { BookOpen, CheckCircle, Clock, Download, ExternalLink } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface SyllabusCurriculumScreenProps {
  onBackToDashboard: () => void;
}

const SUBJECT_SYLLABUS = [
  {
    name: 'Mathematics',
    code: 'MATH-041',
    board: 'CBSE Class 10',
    progress: 75,
    unitsCompleted: 11,
    totalUnits: 15,
    prescribedBook: 'NCERT Mathematics Textbook for Class X',
    chapters: [
      { title: 'Real Numbers & Polynomials', status: 'Completed' },
      { title: 'Pair of Linear Equations in Two Variables', status: 'Completed' },
      { title: 'Quadratic Equations & Arithmetic Progressions', status: 'Completed' },
      { title: 'Triangles & Coordinate Geometry', status: 'Completed' },
      { title: 'Introduction to Trigonometry & Applications', status: 'In Progress' },
      { title: 'Circles, Areas Related to Circles & Volumes', status: 'Upcoming' },
      { title: 'Statistics & Probability', status: 'Upcoming' },
    ],
  },
  {
    name: 'Science & Lab Work',
    code: 'SCI-086',
    board: 'CBSE Class 10',
    progress: 70,
    unitsCompleted: 10,
    totalUnits: 14,
    prescribedBook: 'NCERT Science Textbook & Laboratory Manual Class X',
    chapters: [
      { title: 'Chemical Reactions and Equations', status: 'Completed' },
      { title: 'Acids, Bases and Salts', status: 'Completed' },
      { title: 'Metals and Non-metals', status: 'Completed' },
      { title: 'Life Processes (Nutrition & Respiration)', status: 'Completed' },
      { title: 'Control and Coordination', status: 'In Progress' },
      { title: 'Light - Reflection and Refraction', status: 'Completed' },
      { title: 'Electricity & Magnetic Effects', status: 'Upcoming' },
    ],
  },
  {
    name: 'English Language & Literature',
    code: 'ENG-184',
    board: 'CBSE Class 10',
    progress: 85,
    unitsCompleted: 17,
    totalUnits: 20,
    prescribedBook: 'First Flight & Footprints Without Feet',
    chapters: [
      { title: 'A Letter to God & Dust of Snow', status: 'Completed' },
      { title: 'Nelson Mandela: Long Walk to Freedom', status: 'Completed' },
      { title: 'Two Stories about Flying & The Ball Poem', status: 'Completed' },
      { title: 'Formal Letter & Analytical Paragraph Writing', status: 'Completed' },
      { title: 'Glimpses of India & Madam Rides the Bus', status: 'In Progress' },
      { title: 'The Proposal (Drama)', status: 'Upcoming' },
    ],
  },
  {
    name: 'Social Science',
    code: 'SOC-087',
    board: 'CBSE Class 10',
    progress: 65,
    unitsCompleted: 13,
    totalUnits: 20,
    prescribedBook: 'India & Contemporary World II, Democratic Politics II',
    chapters: [
      { title: 'The Rise of Nationalism in Europe', status: 'Completed' },
      { title: 'Nationalism in India', status: 'Completed' },
      { title: 'Resources and Development & Forest Wildlife', status: 'Completed' },
      { title: 'Power Sharing & Federalism', status: 'Completed' },
      { title: 'Money and Credit & Sectors of Economy', status: 'In Progress' },
      { title: 'Globalization & Consumer Rights', status: 'Upcoming' },
    ],
  },
  {
    name: 'Computer Applications',
    code: 'CA-165',
    board: 'CBSE Class 10',
    progress: 80,
    unitsCompleted: 8,
    totalUnits: 10,
    prescribedBook: 'Computer Applications for Class X (CBSE)',
    chapters: [
      { title: 'Basics of Information Technology & Internet', status: 'Completed' },
      { title: 'HTML-I: Basic HTML Elements and Lists', status: 'Completed' },
      { title: 'HTML-II: Images, Links, Tables and Forms', status: 'Completed' },
      { title: 'Cyber Ethics & Intellectual Property Rights', status: 'In Progress' },
      { title: 'Practical Python / Scratch Programming', status: 'Upcoming' },
    ],
  },
  {
    name: 'Hindi Course A',
    code: 'HIN-002',
    board: 'CBSE Class 10',
    progress: 70,
    unitsCompleted: 12,
    totalUnits: 17,
    prescribedBook: 'Kshitij Bhag 2 & Kritika Bhag 2',
    chapters: [
      { title: 'Surdas ke Pad & Netaji ka Chashma', status: 'Completed' },
      { title: 'Balgobin Bhagat & Ram-Lakshman-Parshuram Samvad', status: 'Completed' },
      { title: 'Lakhnavi Andaz & Utsah, At-Nahi-Rahi-Hai', status: 'Completed' },
      { title: 'Mata ka Anchal & George Pancham ki Naak', status: 'In Progress' },
      { title: 'Vyakaran: Vakya, Vachya, Pad Parichay', status: 'Upcoming' },
    ],
  },
];

export default function SyllabusCurriculumScreen({
  onBackToDashboard,
}: SyllabusCurriculumScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Syllabus & Curriculum"
        subtitle="Term 1 & Term 2 subject curriculum outline, chapter tracking, and prescribed textbooks"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => alert('Full Class 10 Curriculum PDF downloaded.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download CBSE Syllabus</span>
        </button>
      </PortalPageHeader>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECT_SYLLABUS.map((sub) => (
          <div
            key={sub.code}
            className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {sub.code}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{sub.board}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{sub.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {sub.prescribedBook}
              </p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Curriculum Progress</span>
                  <span className="font-bold text-slate-800">{sub.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 text-right">
                  {sub.unitsCompleted} of {sub.totalUnits} Units Covered
                </div>
              </div>

              {/* Chapter Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Key Units & Chapters
                </span>
                <div className="space-y-1.5">
                  {sub.chapters.slice(0, 4).map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate max-w-[200px]">{ch.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          ch.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ch.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ch.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Action */}
            <button
              type="button"
              onClick={() => alert(`Opening ${sub.name} curriculum details.`)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100"
            >
              <span>View Full Chapter Breakdown</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
