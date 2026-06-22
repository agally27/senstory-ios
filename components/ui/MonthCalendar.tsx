import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { colors } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

// Month grid with a dot on days that have entries. Tapping a day calls onSelect.
export function MonthCalendar({
  month,
  selected,
  markedDates,
  onSelect,
  onPrev,
  onNext,
}: {
  month: Date;
  selected: Date;
  markedDates: Set<string>;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Pressable onPress={onPrev} hitSlop={10} className="w-8 h-8 items-center justify-center">
          <Ionicons name="chevron-back" size={20} color={colors.slate[500]} />
        </Pressable>
        <Text className="text-base font-semibold text-slate-700">
          {format(month, "MMMM yyyy")}
        </Text>
        <Pressable onPress={onNext} hitSlop={10} className="w-8 h-8 items-center justify-center">
          <Ionicons name="chevron-forward" size={20} color={colors.slate[500]} />
        </Pressable>
      </View>

      <View className="flex-row mb-1">
        {weekdays.map((d, i) => (
          <Text key={i} className="flex-1 text-center text-xs text-slate-400 font-medium">
            {d}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isSel = isSameDay(day, selected);
          const marked = markedDates.has(format(day, "yyyy-MM-dd"));
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onSelect(day)}
              style={{ width: `${100 / 7}%` }}
              className="items-center py-1.5"
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isSel ? "bg-emerald-500" : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSel
                      ? "text-white font-bold"
                      : inMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {format(day, "d")}
                </Text>
              </View>
              <View
                className="rounded-full mt-0.5"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: marked && !isSel ? colors.emerald[400] : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
