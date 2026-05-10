'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { Users, Calendar, Activity, Receipt } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
        <p className="text-slate-400 mt-1">Here is what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">1,248</div>
            <p className="text-xs text-emerald-400 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">24</div>
            <p className="text-xs text-slate-500 mt-1">4 pending confirmation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">86</div>
            <p className="text-xs text-emerald-400 mt-1">+4 new this week</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Daily Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">$4,250</div>
            <p className="text-xs text-emerald-400 mt-1">+18% vs yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-slate-900 border-slate-800 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-50">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold mr-4">
                    {`P${i}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Patient Name {i}</p>
                    <p className="text-xs text-slate-500">Root Canal Treatment • Dr. Smith</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">10:{i}0 AM</p>
                    <p className="text-xs text-teal-400">Confirmed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-50">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-slate-900 bg-teal-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-slate-950/50 border border-slate-800 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-slate-200">Payment Received</div>
                      <time className="text-xs text-slate-500 font-medium">Just now</time>
                    </div>
                    <div className="text-sm text-slate-400">$250 for consultation.</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
