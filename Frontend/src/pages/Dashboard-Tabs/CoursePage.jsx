"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Download, BookOpen, FileText, GraduationCap } from "lucide-react"
import axiosInstance from "@/api/axiosInstance"
import { useQuery } from "@tanstack/react-query"
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { useNavigate } from "react-router-dom"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Important: Set the worker source


const CoursePage = () => {
  const { courseId } = useParams()
  const { toast } = useToast()
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [isViewingChapter, setIsViewingChapter] = useState(false)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(0.5)
  const navigate = useNavigate();

  const {
    data: course,
    isLoading: isCourseLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      return response.data
    },
  })

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => Math.min(Math.max(prevPageNumber + offset, 1), numPages))
  }

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5))
  }

  const handleDownloadPDF = async () => {
    if (!selectedChapter) return

    try {
      const fileUrl = selectedChapter.file.includes("fl_attachment")
        ? selectedChapter.file
        : selectedChapter.file.replace("/upload/", "/upload/fl_attachment/")

      // Fetch the file as a Blob
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du fichier")
      }
      const blob = await response.blob()

      // Create a download link
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.href = url
      link.setAttribute("download", `${selectedChapter.title}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast({
        title: "Succès",
        description: "Le fichier a été téléchargé avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive",
      })
    }
  }

  const getChapterTypeIcon = (type) => {
    switch (type) {
      case "evaluation":
        return <FileText className="h-4 w-4 mr-2" />
      case "exercise":
        return <GraduationCap className="h-4 w-4 mr-2" />
      case "lesson":
      default:
        return <BookOpen className="h-4 w-4 mr-2" />
    }
  }

  const getChapterTypeLabel = (type) => {
    switch (type) {
      case "evaluation":
        return "Devoir"
      case "exercise":
        return "Exercice"
      case "lesson":
        return "Leçon"
      default:
        return "Autre"
    }
  }

  if (isCourseLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-destructive font-semibold">Le cours demandé est introuvable.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour aux cours
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {isViewingChapter && selectedChapter ? (
        // Chapter view mode
        <div className="flex flex-col w-full h-[calc(100vh-8rem)]">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewingChapter(false)
                setSelectedChapter(null)
              }}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Revenir à la liste des chapitres
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={zoomOut} className="px-3">
                -
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button variant="outline" onClick={zoomIn} className="px-3">
                +
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2 ml-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>

          <Card className="flex-grow overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center">
                <div>
                  {selectedChapter.title}
                  <Badge className="ml-2" variant="outline">
                    {getChapterTypeLabel(selectedChapter.type)}
                  </Badge>
                </div>
                <div className="text-sm font-normal">
                  Page {pageNumber} sur {numPages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)] overflow-auto">
              <div className="flex justify-center">
                <Document
                  file={selectedChapter.file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  }
                  error={
                    <div className="flex flex-col items-center justify-center h-64 text-destructive">
                      <p>Impossible de charger le PDF. Veuillez réessayer.</p>
                    </div>
                  }
                >
                  <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
                </Document>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-4 gap-2">
            <Button variant="outline" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
              Page précédente
            </Button>
            <Button variant="outline" onClick={() => changePage(1)} disabled={pageNumber >= numPages}>
              Page suivante
            </Button>
          </div>
        </div>
      ) : (
        // Chapter list view mode
        <div className="space-y-6">
          {course && (
            <>
            <Button
              onClick={() => {
                navigate("/admin/dashboard")
              }}
            >Revenir a la liste des cours</Button>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                {course.description && <p className="text-muted-foreground">{course.description}</p>}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Liste des chapitres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[70vh] pr-4">
                    {course.chapters && course.chapters.length > 0 ? (
                      <div className="space-y-2">
                        {course.chapters.map((chapter, index) => (
                          <Card
                            key={index}
                            className={`transition-all hover:shadow-md ${chapter.isLocked ? "opacity-60" : "cursor-pointer"}`}
                            onClick={() => {
                              if (!chapter.isLocked) {
                                setSelectedChapter(chapter)
                                setIsViewingChapter(true)
                              }
                            }}
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                {getChapterTypeIcon(chapter.type)}
                                <span className="font-medium">{chapter.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={chapter.isLocked ? "outline" : "secondary"}>
                                  {chapter.isLocked ? "Verrouillé" : getChapterTypeLabel(chapter.type)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <BookOpen className="h-10 w-10 mb-2 opacity-50" />
                        <p>Aucun chapitre disponible pour ce cours.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CoursePage
