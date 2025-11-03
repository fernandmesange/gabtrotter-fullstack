"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, X, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import axiosInstance from '@/api/axiosInstance'

export default function FormBuilder() {
  const [formFields, setFormFields] = useState([])
  const [fieldType, setFieldType] = useState('text')
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const [radioOptions, setRadioOptions] = useState([''])
  const [title, setTitle] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  const addField = () => {
    if (fieldLabel.trim() && fieldType) {
      const newField = {
        type: fieldType,
        label: fieldLabel,
        ...(fieldType === 'radio' && { options: radioOptions.filter(option => option.trim() !== '') }),
      }

      if (editingIndex !== null) {
        const updatedFields = [...formFields]
        updatedFields[editingIndex] = newField
        setFormFields(updatedFields)
        setEditingIndex(null)
      } else {
        setFormFields([...formFields, newField])
      }

      setFieldLabel('')
      setFieldValue('')
      setRadioOptions([''])
      setFieldType('text')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const surveyData = {
      title: title,
      fields: formFields,
    }

    try {
      const response = await axiosInstance.post(`/surveys/create`, surveyData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      console.log('Réponse du serveur:', response.data)
      toast({
        title: 'Enquête créée avec succès !',
        description: 'Votre enquête a été créée avec succès.',
      })
    } catch (error) {
      console.log(surveyData)
      console.error('Erreur lors de l\'envoi du formulaire:', error.response?.data)
      toast({
        title: 'Erreur lors de la création de l\'enquête',
        description: 'Une erreur est survenue lors de la création de l\'enquête. Veuillez réessayer.',
        variant: 'destructive',
      })
    }
  }

  const addRadioOption = () => {
    setRadioOptions([...radioOptions, ''])
  }

  const updateRadioOption = (index, value) => {
    const newOptions = [...radioOptions]
    newOptions[index] = value
    setRadioOptions(newOptions)
  }

  const removeRadioOption = (index) => {
    const newOptions = radioOptions.filter((_, i) => i !== index)
    setRadioOptions(newOptions)
  }

  const editField = (index) => {
    const fieldToEdit = formFields[index]
    setFieldType(fieldToEdit.type)
    setFieldLabel(fieldToEdit.label)
    if (fieldToEdit.type === 'radio') {
      setRadioOptions(fieldToEdit.options || [''])
    }
    setEditingIndex(index)
  }

  const deleteField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index)
    setFormFields(updatedFields)
  }

  const renderFieldInput = () => {
    switch (fieldType) {
      case 'text':
        return (
          <Input
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            placeholder="Enter text"
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        )
      case 'scale':
        return (
          <Slider
            min={1}
            max={10}
            step={1}
            value={[parseInt(fieldValue) || 1]}
            onValueChange={(val) => setFieldValue(val[0].toString())}
          />
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {radioOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateRadioOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRadioOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRadioOption}
              className="mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un choix
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="">
      <div>
        <CardHeader>
          <CardTitle>Créer une enquête</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="surveyTitle">Titre de l'enquête</Label>
          <Input 
            id="surveyTitle"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          /> 

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldType">Type de champ</Label>
              <Select value={fieldType} onValueChange={(value) => setFieldType(value)}>
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Nombre</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="scale">Echelle (1-10)</SelectItem>
                  <SelectItem value="radio">Choix unique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Nom du champ</Label>
              <Input
                id="fieldLabel"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Enter label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldValue">
                {fieldType === 'radio' ? 'Différents choix' : 'Valeur du champ'}
              </Label>
              {renderFieldInput()}
            </div>

            <div className="flex space-x-2 flex-wrap gap-3 justify-start items-start">
              <Button type="button" onClick={addField}>
                {editingIndex !== null ? 'Modifier le champ' : 'Ajouter un champ'}
              </Button>
              <Button type="submit">Publier l'enquête</Button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Prévisualisation de l'enquête:</h2>
            {formFields.map((field, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{field.label}</p>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editField(index)}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Type: {field.type}</p>
                  {field.type === 'radio' ? (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Options:</p>
                      <ul className="list-disc list-inside">
                        {field.options?.map((option, optionIndex) => (
                          <li key={optionIndex} className="text-sm text-muted-foreground">{option}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Value: {field.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  )
}