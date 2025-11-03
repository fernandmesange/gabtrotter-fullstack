import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { format } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import axiosInstance from '@/api/axiosInstance';

const SurveyResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // État pour gérer l'ouverture du Dialog
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalResponses, setTotalResponses] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        const response = await  axiosInstance.get(`/surveys/survey-responses/${id}`, {
          params: {
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
          },
        });
        setResponses(response.data.responses);
        setTotalResponses(response.data.totalResponses);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError("Une erreur est survenue lors du chargement des réponses.",error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id, pagination.pageIndex, pagination.pageSize]);

  const handleResponseClick = (response) => {
    setSelectedResponse(response);
    setIsDialogOpen(true); // Ouvrir le Dialog directement
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row, index) => pagination.pageIndex * pagination.pageSize + index + 1, {
        id: 'index',
        cell: info => info.getValue(),
        header: 'N°',
      }),
      columnHelper.accessor('createdAt', {
        cell: info => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm'),
        header: 'Date',
      }),
      columnHelper.accessor('agentId.fullname', {
        cell: info => info.getValue(),
        header: 'Agent',
      }),
      columnHelper.accessor('id', {
        cell: info => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResponseClick(info.row.original)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Voir les détails
          </Button>
        ),
        header: 'Action',
      }),
    ],
    [pagination]
  );

  const table = useReactTable({
    data: responses,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (loading && responses.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="w-[250px] h-[20px] mb-4" />
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (responses.length === 0) {
    return <div className="container mx-auto p-4">Aucune réponse trouvée pour ce sondage.</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <Button className="bg-orange-500 mb-4" onClick={() => navigate('/admin/dashboard/?tabs=surveys')}>
        Revenir sur la liste des sondages
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Réponses au sondage : {responses[0]?.surveyId?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">Nombre total de réponses : {totalResponses}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} sur {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>

      {/* Dialog pour les détails */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails de la réponse</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[60vh]">
            {selectedResponse && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Date de mise en ligne : {format(new Date(selectedResponse.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date d&apos;obtention sur le terrain : {format(new Date(selectedResponse.localDate), 'dd/MM/yyyy HH:mm')}
                </p>
                {Object.entries(JSON.parse(selectedResponse.responses)).map(([question, answer]) => (
                  <div key={question} className="border-b pb-2">
                    <p className="font-medium">{question}</p>
                    <p className="text-sm text-muted-foreground">{answer}</p>
                  </div>
                ))}
                {selectedResponse.location && (
                  <div className="border-b pb-2">
                    <p className="font-medium">Localisation</p>
                    <Map location={selectedResponse.location} />
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveyResponses;
