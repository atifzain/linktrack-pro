// ============================================================
// supabase.js — LinkTrack Pro Supabase client
// Place this file at: src/lib/supabase.js
//
// Install:  npm install @supabase/supabase-js
// Env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
//           (or REACT_APP_ prefix for Create React App)
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ============================================================
// AUTH HELPERS
// ============================================================

export const auth = {
  /** Sign in with email + password */
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  /** Sign out */
  signOut: () => supabase.auth.signOut(),

  /** Get current session */
  getSession: () => supabase.auth.getSession(),

  /** Get current user */
  getUser: () => supabase.auth.getUser(),

  /** Listen for auth state changes */
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange(callback),

  /** Admin: invite a new user (sends email invite) */
  inviteUser: (email) =>
    supabase.auth.admin.inviteUserByEmail(email),
};

// ============================================================
// PROJECTS
// ============================================================

export const projects = {
  /** Fetch all projects with user count */
  getAll: () =>
    supabase
      .from('projects')
      .select(`
        *,
        project_users (
          user_id,
          profiles ( id, full_name, avatar_color, role )
        )
      `)
      .order('created_at', { ascending: false }),

  /** Get single project with full detail */
  getById: (id) =>
    supabase
      .from('projects')
      .select(`
        *,
        project_users (
          user_id,
          profiles ( id, full_name, avatar_color, role )
        ),
        submissions (
          id, status, submitted_at, live_url, notes,
          directories ( id, name, category, domain_authority )
        )
      `)
      .eq('id', id)
      .single(),

  /** Create a new project */
  create: (data) =>
    supabase.from('projects').insert(data).select().single(),

  /** Update a project */
  update: (id, data) =>
    supabase.from('projects').update(data).eq('id', id).select().single(),

  /** Delete a project (admin only) */
  delete: (id) =>
    supabase.from('projects').delete().eq('id', id),

  /** Assign users to a project */
  assignUsers: (projectId, userIds, assignedBy) => {
    const rows = userIds.map((uid) => ({
      project_id: projectId,
      user_id: uid,
      assigned_by: assignedBy,
    }));
    return supabase.from('project_users').upsert(rows);
  },

  /** Remove a user from a project */
  removeUser: (projectId, userId) =>
    supabase
      .from('project_users')
      .delete()
      .match({ project_id: projectId, user_id: userId }),

  /** Get progress summary (from view) */
  getProgress: () =>
    supabase.from('project_progress').select('*').order('completion_pct', { ascending: true }),
};

// ============================================================
// USERS / PROFILES
// ============================================================

export const users = {
  /** Get all user profiles */
  getAll: () =>
    supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name'),

  /** Get user by ID */
  getById: (id) =>
    supabase.from('profiles').select('*').eq('id', id).single(),

  /** Update profile */
  update: (id, data) =>
    supabase.from('profiles').update(data).eq('id', id).select().single(),

  /** Get user performance (from view) */
  getPerformance: () =>
    supabase.from('user_performance').select('*').order('completed', { ascending: false }),

  /** Get projects assigned to a user */
  getProjects: (userId) =>
    supabase
      .from('project_users')
      .select('project_id, projects(*)')
      .eq('user_id', userId),
};

// ============================================================
// DIRECTORIES
// ============================================================

export const directories = {
  /** Get all directories */
  getAll: () =>
    supabase
      .from('directories')
      .select('*')
      .eq('is_active', true)
      .order('domain_authority', { ascending: false }),

  /** Get directories grouped by category */
  getByCategory: async () => {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('is_active', true)
      .order('domain_authority', { ascending: false });
    if (error) throw error;
    return data.reduce((acc, dir) => {
      (acc[dir.category] = acc[dir.category] || []).push(dir);
      return acc;
    }, {});
  },

  /** Create a directory */
  create: (data) =>
    supabase.from('directories').insert(data).select().single(),

  /** Update */
  update: (id, data) =>
    supabase.from('directories').update(data).eq('id', id).select().single(),

  /** Coverage stats (from view) */
  getCoverage: () =>
    supabase.from('directory_coverage').select('*').order('domain_authority', { ascending: false }),
};

// ============================================================
// SUBMISSIONS
// ============================================================

export const submissions = {
  /** Get all submissions with related data */
  getAll: (filters = {}) => {
    let query = supabase
      .from('submissions')
      .select(`
        *,
        projects ( id, name, niche, city ),
        directories ( id, name, category, domain_authority ),
        profiles ( id, full_name )
      `)
      .order('created_at', { ascending: false });

    if (filters.projectId)  query = query.eq('project_id', filters.projectId);
    if (filters.userId)     query = query.eq('submitted_by', filters.userId);
    if (filters.status)     query = query.eq('status', filters.status);
    if (filters.dateFrom)   query = query.gte('submitted_at', filters.dateFrom);
    if (filters.dateTo)     query = query.lte('submitted_at', filters.dateTo);

    return query;
  },

  /** Get submissions for a specific project */
  getByProject: (projectId) =>
    supabase
      .from('submissions')
      .select(`*, directories(*), profiles(id, full_name)`)
      .eq('project_id', projectId),

  /** Create a submission */
  create: (data) =>
    supabase.from('submissions').insert({
      ...data,
      submitted_at: data.status === 'submitted' ? new Date().toISOString() : null,
    }).select().single(),

  /** Update submission status */
  updateStatus: (id, status, notes = '') =>
    supabase
      .from('submissions')
      .update({
        status,
        notes,
        submitted_at: status === 'submitted' ? new Date().toISOString() : undefined,
      })
      .eq('id', id)
      .select()
      .single(),

  /** Bulk create submissions for a project across all directories */
  initForProject: async (projectId, directoryIds, userId) => {
    const rows = directoryIds.map((did) => ({
      project_id: projectId,
      directory_id: did,
      submitted_by: userId,
      status: 'pending',
    }));
    return supabase.from('submissions').upsert(rows, { onConflict: 'project_id,directory_id' });
  },

  /** Get submission history/audit trail */
  getHistory: (submissionId) =>
    supabase
      .from('submission_history')
      .select(`*, profiles(full_name)`)
      .eq('submission_id', submissionId)
      .order('changed_at', { ascending: false }),
};

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export const realtime = {
  /**
   * Subscribe to submission changes for a project
   * @param {string} projectId
   * @param {function} onUpdate - called with payload on INSERT/UPDATE/DELETE
   * @returns unsubscribe function
   */
  subscribeToProject: (projectId, onUpdate) => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `project_id=eq.${projectId}`,
        },
        onUpdate
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  /** Subscribe to all submission changes (admin view) */
  subscribeToAllSubmissions: (onUpdate) => {
    const channel = supabase
      .channel('all-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, onUpdate)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};

// ============================================================
// EXPORT HELPERS (CSV + PDF)
// ============================================================

/**
 * Convert an array of objects to a CSV string
 */
export function toCSV(rows, columns) {
  const header = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor ? c.accessor(row) : row[c.key];
        const str = val == null ? '' : String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  return [header, ...body].join('\n');
}

/**
 * Download a string as a file in the browser
 */
export function downloadFile(content, filename, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export submissions to CSV */
export async function exportSubmissionsCSV(filters = {}) {
  const { data, error } = await submissions.getAll(filters);
  if (error) throw error;

  const columns = [
    { key: 'id',           label: 'Submission ID' },
    { label: 'Project',    accessor: (r) => r.projects?.name },
    { label: 'Directory',  accessor: (r) => r.directories?.name },
    { label: 'Category',   accessor: (r) => r.directories?.category },
    { label: 'DA',         accessor: (r) => r.directories?.domain_authority },
    { label: 'Submitted By', accessor: (r) => r.profiles?.full_name },
    { key: 'status',       label: 'Status' },
    { key: 'submitted_at', label: 'Submitted At' },
    { key: 'live_url',     label: 'Live URL' },
    { key: 'notes',        label: 'Notes' },
  ];

  const csv = toCSV(data, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `linktrack-submissions-${date}.csv`);
  return data.length;
}

/** Export project progress to CSV */
export async function exportProjectsCSV() {
  const { data, error } = await projects.getProgress();
  if (error) throw error;

  const columns = [
    { key: 'name',            label: 'Project' },
    { key: 'url',             label: 'URL' },
    { key: 'niche',           label: 'Niche' },
    { key: 'city',            label: 'City' },
    { key: 'status',          label: 'Status' },
    { key: 'total_submissions', label: 'Total Dirs' },
    { key: 'submitted_count', label: 'Submitted' },
    { key: 'live_count',      label: 'Live' },
    { key: 'pending_count',   label: 'Pending' },
    { key: 'rejected_count',  label: 'Rejected' },
    { key: 'completion_pct',  label: 'Completion %' },
  ];

  const csv = toCSV(data, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `linktrack-projects-${date}.csv`);
  return data.length;
}

/** Export user performance to CSV */
export async function exportUsersCSV() {
  const { data, error } = await users.getPerformance();
  if (error) throw error;

  const columns = [
    { key: 'full_name',       label: 'Name' },
    { key: 'role',            label: 'Role' },
    { key: 'daily_target',    label: 'Daily Target' },
    { key: 'total_submissions', label: 'Total Submissions' },
    { key: 'completed',       label: 'Completed' },
    { key: 'this_week',       label: 'This Week' },
    { key: 'this_month',      label: 'This Month' },
    { key: 'active_projects', label: 'Active Projects' },
  ];

  const csv = toCSV(data, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `linktrack-users-${date}.csv`);
  return data.length;
}
