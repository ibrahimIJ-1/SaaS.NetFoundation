'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from '@/hooks/use-calendar';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  CheckSquare, Plus, Trash2, Clock, AlertCircle, CalendarDays, Users
} from 'lucide-react';
import { UserTask } from '@/types/calendar';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(2, 'العنوان مطلوب'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  type: z.enum(['General', 'Deadline', 'Filing', 'FollowUp', 'Meeting']),
  assigneeName: z.string().optional(),
});

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  Low: { label: 'منخفضة', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  Medium: { label: 'متوسطة', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  High: { label: 'عالية', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  Urgent: { label: 'حرجة', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  General: { label: 'عام', icon: <CheckSquare className="w-3 h-3" /> },
  Deadline: { label: 'موعد نهائي', icon: <AlertCircle className="w-3 h-3" /> },
  Filing: { label: 'تقديم', icon: <CalendarDays className="w-3 h-3" /> },
  FollowUp: { label: 'متابعة', icon: <Clock className="w-3 h-3" /> },
  Meeting: { label: 'اجتماع', icon: <Users className="w-3 h-3" /> },
};

function TaskCard({ task }: { task: UserTask }) {
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
  const priority = PRIORITY_CONFIG[task.priority];
  const type = TYPE_CONFIG[task.type];

  return (
    <div className={cn(
      "group flex items-start gap-4 p-4 rounded-xl border transition-all",
      task.isCompleted
        ? "bg-secondary/10 border-border opacity-60"
        : isOverdue
        ? "bg-legal-danger/5 border-legal-danger/30"
        : "bg-card/50 border-border hover:border-legal-gold/40"
    )}>
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={(checked) => {
          toggleTask.mutate(
            { id: task.id, isCompleted: !!checked },
            { onSuccess: () => toast.success(checked ? 'تم إنهاء المهمة' : 'تم إعادة فتح المهمة') }
          );
        }}
        className="mt-1 border-border data-[state=checked]:bg-legal-gold data-[state=checked]:border-legal-gold"
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={cn(
            "font-semibold text-foreground",
            task.isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full border", priority.color)}>
            {priority.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
            {type.icon} {type.label}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className={cn(
            "flex items-center gap-1",
            isOverdue && "text-legal-danger font-semibold"
          )}>
            <Clock className="w-3 h-3" />
            {isOverdue ? 'متأخر: ' : 'الموعد: '}
            {new Date(task.dueDate).toLocaleDateString('ar-SA')}
          </span>
          {task.assigneeName && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {task.assigneeName}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-legal-danger hover:bg-legal-danger/10"
        onClick={() => deleteTask.mutate(task.id, {
          onSuccess: () => toast.success('تم حذف المهمة')
        })}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function AddTaskDialog() {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      type: 'General',
      assigneeName: '',
    },
  });

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    createTask.mutate(
      { ...data, dueDate: new Date(data.dueDate).toISOString() },
      {
        onSuccess: () => {
          toast.success('تمت إضافة المهمة');
          form.reset();
          setOpen(false);
        },
        onError: () => toast.error('حدث خطأ'),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
          <Plus className="w-4 h-4 ml-2" />
          مهمة جديدة
        </Button>
      } />
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">العنوان</FormLabel>
                <FormControl><Input className="bg-background" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">النوع</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">عام</SelectItem>
                      <SelectItem value="Deadline">موعد نهائي</SelectItem>
                      <SelectItem value="Filing">تقديم</SelectItem>
                      <SelectItem value="FollowUp">متابعة</SelectItem>
                      <SelectItem value="Meeting">اجتماع</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">الأولوية</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">منخفضة</SelectItem>
                      <SelectItem value="Medium">متوسطة</SelectItem>
                      <SelectItem value="High">عالية</SelectItem>
                      <SelectItem value="Urgent">حرجة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">تاريخ الاستحقاق</FormLabel>
                <FormControl><Input type="datetime-local" className="bg-background" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="assigneeName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">المسؤول (اختياري)</FormLabel>
                <FormControl><Input placeholder="اسم المحامي أو الموظف" className="bg-background" {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">تفاصيل (اختياري)</FormLabel>
                <FormControl><Textarea className="bg-background min-h-[80px]" {...field} /></FormControl>
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={createTask.isPending} className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
                {createTask.isPending ? 'جاري الحفظ...' : 'حفظ المهمة'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const pending = tasks?.filter(t => !t.isCompleted) ?? [];
  const completed = tasks?.filter(t => t.isCompleted) ?? [];
  const overdue = pending.filter(t => new Date(t.dueDate) < new Date());

  const displayed = filter === 'all' ? (tasks ?? []) : filter === 'pending' ? pending : completed;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-legal-gold" />
            المهام والمواعيد
          </h1>
          <p className="text-muted-foreground mt-1">تتبع المهام القانونية والمواعيد النهائية.</p>
        </div>
        <AddTaskDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المهام', value: tasks?.length ?? 0, color: 'text-foreground' },
          { label: 'قيد التنفيذ', value: pending.length, color: 'text-blue-400' },
          { label: 'متأخرة', value: overdue.length, color: 'text-legal-danger' },
          { label: 'مكتملة', value: completed.length, color: 'text-green-400' },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <div className={`text-3xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg w-fit border border-border">
        {([['all', 'الكل'], ['pending', 'قيد التنفيذ'], ['completed', 'مكتملة']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              filter === val
                ? "bg-legal-gold text-legal-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-legal-gold" />
        </div>
      ) : error ? (
        <div className="bg-legal-danger/10 text-legal-danger p-4 rounded-xl border border-legal-danger/20">
          حدث خطأ أثناء تحميل المهام.
        </div>
      ) : displayed.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد مهام في هذا القسم.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {displayed.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
}
