"use client";

import { useState, useMemo } from "react";
import { 
  Select, 
  SelectItem, 
  DatePicker, 
  Button,
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Pagination,
  Textarea
} from "@heroui/react";
import { fromDate } from "@internationalized/date";
import axios from "axios";

const timeZone = "America/Bogota";
const API_BASE_URL = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer';

const competitions = [
  {key: 'all', label: "Todas"},
  {key: 'uefa.champions', label: "Champions League"},
  {key: 'uefa.europa', label: "Europa League"},
  {key: 'eng.1', label: "Premier League"},
  {key: 'esp.1', label: "La Liga"},
  {key: 'ita.1', label: "Serie A"},
  {key: 'ger.1', label: "Bundesliga"},
  {key: 'fra.1', label: "Ligue 1"},
  {key: 'col.1', label: "Liga BetPlay"},
];

export default function Home() {

  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const getFixures = async () => {
    const response = await axios.get(`${API_BASE_URL}/${selectedCompetition}/scoreboard?dates=${selectedDate}`)
    console.log(response.data.events)
    setData(response.data.events)
  }

  const pages = Math.ceil(data.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);

  const getStats = async (eventId: number) => {
    const response = await axios.get(`${API_BASE_URL}/${selectedCompetition}/summary?event=${eventId}`)
    console.log(response.data)
  }

  const getKeyValue = (item: any, key: string) => {
    if (key === "date" && item.date) {
      return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone
      }).format(new Date(item.date));
    }

    if (key === "action") {
      return (
        <Button 
          size="sm"
          color="primary"
          className="w-2/12"
          onPress={() => getStats(item.id)}
        >GO</Button>
      );
    }
    return item[key];
  };

  return (
    <div className="flex gap-4">
      {/* Left Section */}
      <div className="w-2/3 p-3 shadow-md">
        {/* Form Section */}
        <div className="flex items-center gap-3 mb-4">
          <Select 
            className="w-5/12" 
            label="Competiciones"
            placeholder="Seleccione Competiciones" 
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >
            {competitions.map((competition) => (
              <SelectItem key={competition.key}>{competition.label}</SelectItem>
            ))}
          </Select>
          <DatePicker 
            label="Fecha"
            className="w-5/12" 
            minValue={fromDate(new Date(), timeZone)} 
            onChange={(e) => setSelectedDate(`${e?.year}${e?.month.toString().padStart(2, "0")}${e?.day.toString().padStart(2, "0")}`)}
          />
          <Button 
            color="primary"
            className="w-2/12"
            onPress={getFixures}
          >Buscar</Button>
        </div>

        {/* Table Section */}
        <Table 
          aria-label="Events table" 
          className="w-full"
          selectionMode="single"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
        >
          <TableHeader>
            <TableColumn>Id</TableColumn>
            <TableColumn>Fecha</TableColumn>
            <TableColumn>Evento</TableColumn>
            <TableColumn>Predecir</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No se encontraron eventos."} items={items}>
            {(item: any) => (
              <TableRow key={item.id}>
                {(["id", "date", "name", "action"]).map((columnKey) => (
                  <TableCell key={columnKey}>{getKeyValue(item, columnKey)}</TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Right Section */}
      <div className="w-1/3 p-4 shadow-md flex items-start">
        <Textarea
          isReadOnly
          className="w-full"
          label="Predicción"
          labelPlacement="outside"
        />
      </div>
    </div>
  );
}
