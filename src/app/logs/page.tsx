"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  RotateCcw,
  Info,
  AlertTriangle,
  XCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LogEntry } from "@/utils/logger";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BarChart } from "@/components/ui/bar-chart";

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("Past 24 hours");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/logs?date=${date}&page=${currentPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      // Sort logs in descending order by timestamp
      const sortedLogs = data.sort(
        (a: LogEntry, b: LogEntry) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sortedLogs);
      setTotalPages(Math.ceil(data.length / 50)); // Assuming 50 logs per page
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError("Failed to fetch logs. Please try again.");
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [date, currentPage]);

  const chartData = useMemo(() => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(
      (log) => new Date(log.timestamp) >= twoHoursAgo
    );

    const groupedData: { [key: string]: number } = {};

    // Initialize all minutes in the last 2 hours
    for (let i = 0; i < 120; i++) {
      const time = new Date(twoHoursAgo.getTime() + i * 60000);
      const minuteKey = time.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      groupedData[minuteKey] = 0;
    }

    filteredLogs.forEach((log) => {
      const logTime = new Date(log.timestamp);
      const minuteKey = logTime.toISOString().slice(0, 16);
      if (groupedData.hasOwnProperty(minuteKey)) {
        groupedData[minuteKey]++;
      }
    });

    return Object.entries(groupedData)
      .map(([time, count]) => ({
        time: time.slice(11, 16), // Extract HH:mm
        count,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  const handleSaveFilters = () => {
    // Implement save filters functionality here
    console.log("Saving filters");
  };

  const handleResetFilters = () => {
    // Implement reset filters functionality here
    console.log("Resetting filters");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    setCurrentPage(1);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "http":
        return <Globe className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "border-green-500";
    if (status >= 300 && status < 400) return "border-blue-500";
    if (status >= 400 && status < 500) return "border-yellow-500";
    if (status >= 500) return "border-red-500";
    return "border-gray-500";
  };

  const formatJSON = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-sm font-semibold mb-4 text-gray-300">Filters</h2>
          <Button
            size="sm"
            className="w-full mb-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            onClick={handleSaveFilters}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full mb-4 text-xs border-gray-600 text-gray-300"
            onClick={handleResetFilters}
          >
            Reset
          </Button>

          <Separator className="my-4 bg-gray-700" />

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium mb-2 text-gray-400">Date</h3>
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                max={today}
                className="w-full h-8 text-xs bg-gray-800 border-gray-600 text-gray-300"
              />
            </div>

            <div>
              <h3 className="text-xs font-medium mb-2 text-gray-400">
                Timeline
              </h3>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full h-8 text-xs bg-gray-800 border-gray-600 text-gray-300">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-gray-300">
                  <SelectItem value="Past 30 minutes">
                    Past 30 minutes
                  </SelectItem>
                  <SelectItem value="Past 1 hour">Past 1 hour</SelectItem>
                  <SelectItem value="Past 24 hours">Past 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-xs font-medium mb-2 text-gray-400">Level</h3>
              <div className="space-y-2">
                {["Http", "Info", "Warning", "Error"].map((level) => (
                  <div key={level} className="flex items-center">
                    <Checkbox
                      id={level.toLowerCase()}
                      className="h-3 w-3 border-gray-600"
                    />
                    <Label
                      htmlFor={level.toLowerCase()}
                      className="ml-2 text-xs text-gray-300"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 p-4 flex items-center border-b border-gray-700">
          <Filter className="mr-2 text-gray-400 h-4 w-4" />
          <Input
            className="flex-1 mr-2 h-8 text-xs bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-gray-600 text-gray-300 bg-gray-700"
            onClick={fetchLogs}
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Chart */}
        <div className="p-2 bg-gray-900 border-b border-gray-800">
          <div className="h-32">
            <BarChart data={chartData} />
          </div>
        </div>

        {/* Log table */}
        <ScrollArea className="flex-1">
          {loading && (
            <p className="p-4 text-center text-gray-400">Loading logs...</p>
          )}
          {error && <p className="p-4 text-center text-red-400">{error}</p>}
          {!loading && !error && logs.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-xs">
                  <th className="p-2 text-left font-medium w-40 whitespace-nowrap">
                    Time
                  </th>
                  <th className="p-2 text-left font-medium w-20 whitespace-nowrap">
                    Status
                  </th>
                  <th className="p-2 text-left font-medium w-12 whitespace-nowrap">
                    Level
                  </th>
                  <th className="p-2 text-left font-medium w-20 whitespace-nowrap">
                    Method
                  </th>
                  <th className="p-2 text-left font-medium">URL</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <Sheet key={index}>
                    <SheetTrigger asChild>
                      <tr className="border-b border-gray-700 text-xs hover:bg-gray-800 cursor-pointer">
                        <td className="p-2 text-gray-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <span
                            className={`inline-block w-14 text-center py-1 rounded-sm border ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2">{getLevelIcon(log.level)}</td>
                        <td className="p-2 text-gray-100 whitespace-nowrap">
                          {log.method}
                        </td>
                        <td className="p-2 text-gray-100 truncate max-w-xs">
                          {log.url}
                        </td>
                      </tr>
                    </SheetTrigger>
                    <SheetContent className="bg-gray-900 text-gray-100 w-[600px] sm:w-[900px] overflow-y-auto">
                      <SheetHeader className="border-b border-gray-700 pb-4 mb-4">
                        <div className="flex justify-between items-center">
                          <SheetTitle className="text-gray-100 text-xl font-semibold">
                            Details
                          </SheetTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            Raw
                          </Button>
                        </div>
                      </SheetHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Status
                            </h3>
                            <p className="text-sm text-gray-100">
                              {log.status}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Method
                            </h3>
                            <p className="text-sm text-gray-100">
                              {log.method}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Timestamp
                            </h3>
                            <p className="text-sm text-gray-100">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              IP Address
                            </h3>
                            <p className="text-sm text-gray-100"></p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Origin Country
                            </h3>
                            <p className="text-sm text-gray-100"></p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              URL
                            </h3>
                            <p className="text-sm text-gray-100 break-all">
                              {log.url}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Request Metadata
                          </h3>
                          <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded-lg overflow-x-auto">
                            {formatJSON(JSON.stringify(""))}
                          </pre>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Request Body
                          </h3>
                          <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded-lg overflow-x-auto">
                            {formatJSON(log.body || "No body content")}
                          </pre>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && logs.length === 0 && (
            <p className="p-4 text-center text-gray-400">
              No logs found for the selected date.
            </p>
          )}
        </ScrollArea>

        {/* Pagination */}
        <div className="bg-gray-800 p-2 flex justify-between items-center border-t border-gray-700">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-gray-600 text-gray-300 bg-gray-700"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || logs.length === 0}
          >
            Previous
          </Button>
          <span className="text-gray-400 text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-gray-600 text-gray-300 bg-gray-700"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || logs.length === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
