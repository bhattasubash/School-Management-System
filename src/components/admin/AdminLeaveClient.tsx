'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarMinus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  UserCheck,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Building2,
  FileText,
  UserX,
  Plus,
  ArrowRight,
  ShieldCheck,
  Send,
  Eye,
  Check,
  X,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import { AdminTabs } from './ui/AdminTabs';
import AdminModal from './ui/AdminModal';
import AdminDrawer from './ui/AdminDrawer';

export type LeaveType = 'CASUAL' | 'SICK' | 'MATERNITY' | 'EARNED' | 'DUTY_LEAVE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequestItem {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  department: string;
  avatarLetter: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  substituteAssigned?: string | null;
  adminRemarks?: string | null;
}

export interface TeacherLookup {
  id: string;
  name: string;
  department: string;
  employeeId: string;
}

interface AdminLeaveClientProps {
  initialRequests?: LeaveRequestItem[];
  teachers: TeacherLookup[];
}

const mockLeaveRequests: LeaveRequestItem[] = [
  {
    id: 'lr-1',
    teacherId: 't-1',
    teacherName: 'Dr. Ramesh Sharma',
    employeeId: 'EMP-1002',
    department: 'Science',
    avatarLetter: 'R',
    leaveType: 'SICK',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    daysCount: 3,
    reason: 'Severe viral fever and medical recovery as advised by physician.',
    status: 'PENDING',
    appliedOn: '2026-10-02',
    substituteAssigned: null,
  },
  {
    id: 'lr-2',
    teacherId: 't-2',
    teacherName: 'Sunita Verma',
    employeeId: 'EMP-1004',
    department: 'Mathematics',
    avatarLetter: 'S',
    leaveType: 'CASUAL',
    startDate: '2026-10-06',
    endDate: '2026-10-06',
    daysCount: 1,
    reason: 'Family engagement and personal urgent errands.',
    status: 'PENDING',
    appliedOn: '2026-10-01',
    substituteAssigned: null,
  },
  {
    id: 'lr-3',
    teacherId: 't-3',
    teacherName: 'Priya Iyer',
    employeeId: 'EMP-1008',
    department: 'English',
    avatarLetter: 'P',
    leaveType: 'DUTY_LEAVE',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    daysCount: 3,
    reason: 'CBSE Regional Curriculum Workshop & Training Conference delegation.',
    status: 'APPROVED',
    appliedOn: '2026-09-28',
    substituteAssigned: 'Kavita Joshi',
    adminRemarks: 'Approved for CBSE official representation.',
  },
  {
    id: 'lr-4',
    teacherId: 't-4',
    teacherName: 'Anil Kumar',
    employeeId: 'EMP-1011',
    department: 'Social Studies',
    avatarLetter: 'A',
    leaveType: 'EARNED',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    daysCount: 3,
    reason: 'Annual family festival attendance in hometown.',
    status: 'APPROVED',
    appliedOn: '2026-09-15',
    substituteAssigned: 'Vikram Seth',
  },
  {
    id: 'lr-5',
    teacherId: 't-5',
    teacherName: 'Meenakshi Rao',
    employeeId: 'EMP-1015',
    department: 'Hindi',
    avatarLetter: 'M',
    leaveType: 'CASUAL',
    startDate: '2026-09-18',
    endDate: '2026-09-19',
    daysCount: 2,
    reason: 'Personal urgent matters during midterm examination week.',
    status: 'REJECTED',
    appliedOn: '2026-09-16',
    adminRemarks: 'Midterm exam duties scheduled. Leave cannot be sanctioned.',
  },
];

export default function AdminLeaveClient({
  initialRequests = mockLeaveRequests,
  teachers,
}: AdminLeaveClientProps) {
  const [requests, setRequests] = useState<LeaveRequestItem[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Approval Modal state
  const [targetRequest, setTargetRequest] = useState<LeaveRequestItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [subTeacherId, setSubTeacherId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Review Drawer state
  const [drawerRequest, setDrawerRequest] = useState<LeaveRequestItem | null>(null);

  // Metrics
  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'PENDING').length, [requests]);
  const approvedCount = useMemo(() => requests.filter((r) => r.status === 'APPROVED').length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((r) => r.status === 'REJECTED').length, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      const matchSearch =
        searchTerm === '' ||
        r.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'ALL' || r.department === selectedDept;
      const matchType = selectedType === 'ALL' || r.leaveType === selectedType;

      return matchTab && matchSearch && matchDept && matchType;
    });
  }, [requests, activeTab, searchTerm, selectedDept, selectedType]);

  const departments = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.department))).filter(Boolean);
  }, [teachers]);

  const handleOpenActionModal = (req: LeaveRequestItem, type: 'APPROVE' | 'REJECT') => {
    setTargetRequest(req);
    setActionType(type);
    setAdminNotes(type === 'APPROVE' ? 'Approved by Academic Dean / Principal' : 'Request declined due to institutional schedule');
    const defaultSub = teachers.find((t) => t.id !== req.teacherId && t.department === req.department);
    setSubTeacherId(defaultSub?.id || '');
  };

  const handleExecuteAction = () => {
    if (!targetRequest) return;
    setIsProcessing(true);

    setTimeout(() => {
      const subTeacher = teachers.find((t) => t.id === subTeacherId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === targetRequest.id
            ? {
                ...r,
                status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                substituteAssigned: actionType === 'APPROVE' ? subTeacher?.name || null : null,
                adminRemarks: adminNotes,
              }
            : r
        )
      );

      if (drawerRequest && drawerRequest.id === targetRequest.id) {
        setDrawerRequest((prev) =>
          prev
            ? {
                ...prev,
                status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                substituteAssigned: actionType === 'APPROVE' ? subTeacher?.name || null : null,
                adminRemarks: adminNotes,
              }
            : null
        );
      }

      setIsProcessing(false);
      setTargetRequest(null);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Faculty & Staff Leave Desk"
        subtitle="Review leave applications, sanction academic substitute coverage, and inspect faculty availability records."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Leave Management' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/timetable">
              <AdminButton variant="secondary" icon={<Calendar className="w-3.5 h-3.5" />}>
                Timetable Rosters
              </AdminButton>
            </Link>
            <Link href="/admin/academics">
              <AdminButton variant="primary" icon={<UserCheck className="w-3.5 h-3.5" />}>
                Daily Substitutions
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Sanctions</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Awaiting principal approval</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sanctioned Leaves</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Approved with substitute coverage</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Declined Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{rejectedCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Exam duty or conflict overlap</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Roster</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{teachers.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Academic staff members</p>
        </AdminCard>
      </div>

      {/* 3. Navigation Tabs */}
      <AdminTabs
        tabs={[
          { id: 'PENDING', label: 'Pending Sanctions', count: pendingCount },
          { id: 'APPROVED', label: 'Approved Records', count: approvedCount },
          { id: 'REJECTED', label: 'Declined Requests', count: rejectedCount },
          { id: 'ALL', label: 'All Applications', count: requests.length },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* 4. Search & Filters Bar */}
      <AdminCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search faculty name, EMP ID, or reason..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
              >
                <option value="ALL">All Leave Types</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Medical / Sick</option>
                <option value="DUTY_LEAVE">Official Duty</option>
                <option value="EARNED">Earned Leave</option>
                <option value="MATERNITY">Maternity / Paternity</option>
              </select>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* 5. Leave Applications Table */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Faculty Member</th>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Stated Reason</th>
                <th className="py-3.5 px-4">Substitute Coverage</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leave requests found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] border border-blue-100 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                          {req.avatarLetter}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors">
                            {req.teacherName}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {req.employeeId} · {req.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60">
                        {req.leaveType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {req.daysCount} {req.daysCount === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {req.startDate} {req.daysCount > 1 ? `to ${req.endDate}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-1">{req.reason}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.substituteAssigned ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {req.substituteAssigned}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None required / Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setDrawerRequest(req)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </AdminButton>

                      {req.status === 'PENDING' && (
                        <>
                          <AdminButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenActionModal(req, 'APPROVE')}
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </AdminButton>
                          <AdminButton
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenActionModal(req, 'REJECT')}
                            icon={<X className="w-3.5 h-3.5" />}
                          >
                            Decline
                          </AdminButton>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* 6. APPROVAL / REJECTION MODAL */}
      <AdminModal
        isOpen={Boolean(targetRequest)}
        onClose={() => setTargetRequest(null)}
        title={actionType === 'APPROVE' ? 'Sanction Faculty Leave' : 'Decline Leave Application'}
        description={
          targetRequest
            ? `${targetRequest.teacherName} (${targetRequest.employeeId}) · ${targetRequest.daysCount} days (${targetRequest.startDate})`
            : ''
        }
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <AdminButton variant="secondary" onClick={() => setTargetRequest(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant={actionType === 'APPROVE' ? 'primary' : 'destructive'}
              onClick={handleExecuteAction}
              isLoading={isProcessing}
            >
              {actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Decline'}
            </AdminButton>
          </div>
        }
      >
        {targetRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Stated Applicant Reason:</span>
              <p className="font-semibold text-slate-800">{targetRequest.reason}</p>
            </div>

            {actionType === 'APPROVE' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Assign Substitute Faculty Coverage (Optional)
                </label>
                <select
                  value={subTeacherId}
                  onChange={(e) => setSubTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
                >
                  <option value="">No substitute needed (Self-study / Library)</option>
                  {teachers
                    .filter((t) => t.id !== targetRequest.teacherId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Administrative Endorsement Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Remarks recorded in institutional audit log..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:border-[#0B72E7] focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </AdminModal>

      {/* 7. LEAVE DOSSIER DRAWER */}
      <AdminDrawer
        isOpen={Boolean(drawerRequest)}
        onClose={() => setDrawerRequest(null)}
        title={drawerRequest ? drawerRequest.teacherName : 'Leave Dossier'}
        subtitle={drawerRequest ? `${drawerRequest.employeeId} · ${drawerRequest.department}` : ''}
      >
        {drawerRequest && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE]/60">
              <div className="w-14 h-14 rounded-2xl bg-[#0B72E7] text-white flex items-center justify-center font-black text-xl shadow-xs">
                {drawerRequest.avatarLetter}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{drawerRequest.teacherName}</h4>
                <p className="text-xs font-semibold text-[#0B72E7]">{drawerRequest.department} Department</p>
                <p className="text-xs text-slate-500 mt-0.5">Applied on {drawerRequest.appliedOn}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Leave Particulars</h5>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Leave Category:</span>
                  <span className="font-bold text-slate-800">{drawerRequest.leaveType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Days Count:</span>
                  <span className="font-bold text-slate-800">{drawerRequest.daysCount} working days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Calendar Period:</span>
                  <span className="font-semibold text-slate-800">
                    {drawerRequest.startDate} {drawerRequest.daysCount > 1 ? `to ${drawerRequest.endDate}` : ''}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5 font-medium">Reason for Leave:</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{drawerRequest.reason}</p>
                </div>
              </div>
            </div>

            {drawerRequest.substituteAssigned && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-800">Active Substitute Delegated</span>
                <p className="text-emerald-700">
                  {drawerRequest.substituteAssigned} is authorized to cover scheduled periods.
                </p>
              </div>
            )}

            {drawerRequest.adminRemarks && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Principal Remarks</h5>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                  {drawerRequest.adminRemarks}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
