import { Clock, Edit3, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ScheduleClass {
  id: number;
  name: string;
  coach: string;
  day: string;
  time: string;
  duration: number;
  level: string;
  maxCapacity: number;
  enrolled: number;
  price: number;
  recurring: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MOCK_SCHEDULE: ScheduleClass[] = [
  {
    id: 1,
    name: "Reformer Flow",
    coach: "Sophie Leclerc",
    day: "Monday",
    time: "09:00",
    duration: 55,
    level: "Intermediate",
    maxCapacity: 12,
    enrolled: 8,
    price: 45,
    recurring: true,
  },
  {
    id: 2,
    name: "Mat Pilates Core",
    coach: "Julien Moreau",
    day: "Monday",
    time: "11:30",
    duration: 45,
    level: "Beginner",
    maxCapacity: 15,
    enrolled: 12,
    price: 38,
    recurring: true,
  },
  {
    id: 3,
    name: "Cadillac Advanced",
    coach: "Sophie Leclerc",
    day: "Monday",
    time: "17:00",
    duration: 60,
    level: "Advanced",
    maxCapacity: 6,
    enrolled: 5,
    price: 55,
    recurring: true,
  },
  {
    id: 4,
    name: "Reformer Flow",
    coach: "Sophie Leclerc",
    day: "Tuesday",
    time: "09:00",
    duration: 55,
    level: "Intermediate",
    maxCapacity: 12,
    enrolled: 10,
    price: 45,
    recurring: true,
  },
  {
    id: 5,
    name: "Tower Session",
    coach: "Julien Moreau",
    day: "Tuesday",
    time: "14:00",
    duration: 50,
    level: "All Levels",
    maxCapacity: 8,
    enrolled: 3,
    price: 42,
    recurring: true,
  },
  {
    id: 6,
    name: "Mat Pilates Core",
    coach: "Julien Moreau",
    day: "Wednesday",
    time: "09:00",
    duration: 45,
    level: "Beginner",
    maxCapacity: 15,
    enrolled: 14,
    price: 38,
    recurring: true,
  },
  {
    id: 7,
    name: "Reformer Advanced",
    coach: "Sophie Leclerc",
    day: "Wednesday",
    time: "17:00",
    duration: 55,
    level: "Advanced",
    maxCapacity: 10,
    enrolled: 9,
    price: 48,
    recurring: true,
  },
  {
    id: 8,
    name: "Reformer Flow",
    coach: "Sophie Leclerc",
    day: "Thursday",
    time: "09:00",
    duration: 55,
    level: "Intermediate",
    maxCapacity: 12,
    enrolled: 7,
    price: 45,
    recurring: true,
  },
  {
    id: 9,
    name: "Mat Beginner",
    coach: "Julien Moreau",
    day: "Friday",
    time: "11:30",
    duration: 45,
    level: "Beginner",
    maxCapacity: 15,
    enrolled: 6,
    price: 35,
    recurring: true,
  },
  {
    id: 10,
    name: "Weekend Reformer",
    coach: "Sophie Leclerc",
    day: "Saturday",
    time: "10:00",
    duration: 55,
    level: "All Levels",
    maxCapacity: 12,
    enrolled: 11,
    price: 48,
    recurring: true,
  },
];

const EMPTY_FORM = {
  name: "",
  coach: "",
  time: "",
  duration: "",
  level: "Beginner",
  maxCapacity: "",
  price: "",
};

export function ScheduleManager() {
  const [schedule, setSchedule] = useState(MOCK_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduleClass | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const dayClasses = schedule.filter((c) => c.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));

  const resetForm = () => setForm(EMPTY_FORM);

  const handleAddClass = () => {
    if (!form.name.trim() || !form.coach.trim() || !form.time.trim()) {
      toast.error("Please fill in class name, coach, and time.");
      return;
    }
    const newClass: ScheduleClass = {
      id: Date.now(),
      name: form.name.trim(),
      coach: form.coach.trim(),
      day: selectedDay,
      time: form.time.trim(),
      duration: Number(form.duration) || 45,
      level: form.level,
      maxCapacity: Number(form.maxCapacity) || 12,
      enrolled: 0,
      price: Number(form.price) || 40,
      recurring: true,
    };
    setSchedule((prev) => [...prev, newClass]);
    toast.success("Class added!");
    setAddDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (cls: ScheduleClass) => {
    setEditingClass(cls);
    setForm({
      name: cls.name,
      coach: cls.coach,
      time: cls.time,
      duration: String(cls.duration),
      level: cls.level,
      maxCapacity: String(cls.maxCapacity),
      price: String(cls.price),
    });
    setEditDialogOpen(true);
  };

  const handleEditClass = () => {
    if (!editingClass) return;
    if (!form.name.trim() || !form.coach.trim() || !form.time.trim()) {
      toast.error("Please fill in class name, coach, and time.");
      return;
    }
    setSchedule((prev) =>
      prev.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              name: form.name.trim(),
              coach: form.coach.trim(),
              time: form.time.trim(),
              duration: Number(form.duration) || 45,
              level: form.level,
              maxCapacity: Number(form.maxCapacity) || 12,
              price: Number(form.price) || 40,
            }
          : c,
      ),
    );
    toast.success("Class updated!");
    setEditDialogOpen(false);
    setEditingClass(null);
    resetForm();
  };

  const deleteClass = (id: number) => {
    setSchedule((prev) => prev.filter((c) => c.id !== id));
    toast.success("Class removed from schedule");
  };

  const formFields = (
    <div className="flex flex-col gap-3 py-2">
      <Input
        placeholder="Class name (e.g. Reformer Flow)"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        placeholder="Coach name"
        value={form.coach}
        onChange={(e) => setForm((f) => ({ ...f, coach: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Time (e.g. 09:00)"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
        <Input
          placeholder="Duration (min)"
          type="number"
          value={form.duration}
          onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          className="h-10 rounded-xl border bg-muted/50 px-3 text-sm"
          value={form.level}
          onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
          <option>All Levels</option>
        </select>
        <Input
          placeholder="Max capacity"
          type="number"
          value={form.maxCapacity}
          onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))}
        />
      </div>
      <Input
        placeholder="Price (€)"
        type="number"
        value={form.price}
        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Day selector — horizontal scroll of day pills */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {DAYS.map((day) => {
          const count = schedule.filter((c) => c.day === day).length;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {day.slice(0, 3)} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Classes for selected day */}
      <div className="flex flex-col gap-3">
        {dayClasses.map((cls) => (
          <Card key={cls.id} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{cls.name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {cls.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cls.coach}</p>
                  <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {cls.time} · {cls.duration}min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {cls.enrolled}/{cls.maxCapacity}
                    </span>
                    <span className="font-bold text-primary">&euro;{cls.price}</span>
                  </div>
                  {/* Capacity bar */}
                  <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cls.enrolled >= cls.maxCapacity ? "bg-destructive" : cls.enrolled >= cls.maxCapacity * 0.8 ? "bg-accent-cta" : "bg-primary"}`}
                      style={{ width: `${(cls.enrolled / cls.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <button
                    type="button"
                    onClick={() => openEditDialog(cls)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteClass(cls.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {dayClasses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No classes scheduled for {selectedDay}</div>
        )}
      </div>

      {/* Add class dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" className="w-full bg-primary hover:bg-primary/85 gap-2">
            <Plus className="w-4 h-4" /> Add Class to {selectedDay}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class &mdash; {selectedDay}</DialogTitle>
          </DialogHeader>
          {formFields}
          <Button onClick={handleAddClass} className="bg-primary hover:bg-primary/85">
            Add Class
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit class dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingClass(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class &mdash; {editingClass?.name}</DialogTitle>
          </DialogHeader>
          {formFields}
          <Button onClick={handleEditClass} className="bg-primary hover:bg-primary/85">
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
