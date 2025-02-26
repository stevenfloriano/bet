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
import { parseDate, fromDate } from "@internationalized/date";
import { sports, competitions, sportCompetitions } from "../constants/app";
import axios from "axios";

const timeZone = "America/Bogota";
const today = fromDate(new Date(), timeZone);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [selectedSport, setSelectedSport] = useState<string>('soccer');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(`${today.year}${today.month.toString().padStart(2, "0")}${today.day.toString().padStart(2, "0")}`);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const getFixures = async () => {
    const response = await axios.get(`${API_BASE_URL}/${selectedSport}/${selectedCompetition}/scoreboard?dates=${selectedDate}`)
    setData(response.data.events)
  }

  const filteredCompetitions = competitions.filter(comp => sportCompetitions[selectedSport]?.includes(comp.key));
  
  const pages = Math.ceil(data.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);

  const getStats = async (eventId: number) => {
    const response = await axios.get(`${API_BASE_URL}/${selectedSport}/${selectedCompetition}/summary?event=${eventId}`)
    const data = response.data;

    const betingData = {
      boxscore: data.boxscore ?? undefined,
      leaders: data.leaders ?? undefined,
      headToHeadGames: data.headToHeadGames ?? undefined,
      odds: data.odds ?? undefined,
      rosters: data.rosters ?? undefined,
      standings: data.standings ?? undefined
    }
    // enviar al backend
    console.log(betingData)
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

    if (key === "name" && typeof item.name === "string") {
      return item.name.split(" at ").reverse().join(" VS ");
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

  const isFormValid = selectedSport !== "" && selectedCompetition !== "" && selectedDate !== "";

  return (
    <div className="flex gap-4">
      {/* Left Section */}
      <div className="w-2/3 p-3 shadow-md">
        {/* Form Section */}
        <div className="flex items-center gap-3 mb-4">
        <Select 
            className="w-3/12" 
            label="Deporte"
            defaultSelectedKeys={["soccer"]}
            placeholder="Seleccione Deporte" 
            onChange={(e) => setSelectedSport(e.target.value)}
            isRequired
          >
            {sports.map((sport) => (
              <SelectItem key={sport.key}>{sport.label}</SelectItem>
            ))}
          </Select>
          <Select 
            className="w-4/12" 
            label="Competiciones"
            defaultSelectedKeys={["all"]}
            placeholder="Seleccione Competiciones" 
            onChange={(e) => setSelectedCompetition(e.target.value)}
            isRequired
          >
            {filteredCompetitions.map((competition) => (
              <SelectItem key={competition.key}>{competition.label}</SelectItem>
            ))}
          </Select>
          <DatePicker 
            label="Fecha"
            className="w-3/12" 
            minValue={today} 
            defaultValue={parseDate(`${today.year}-${today.month.toString().padStart(2, "0")}-${today.day.toString().padStart(2, "0")}`)} 
            onChange={(e) => setSelectedDate(`${e?.year}${e?.month.toString().padStart(2, "0")}${e?.day.toString().padStart(2, "0")}`)}
          />
          <Button 
            color="primary"
            className="w-2/12"
            onPress={getFixures}
            isDisabled={!isFormValid}
          >
            Buscar
          </Button>
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
