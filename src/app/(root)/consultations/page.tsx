"use client";

import { useState, useEffect, useRef } from "react";
import { Consultation } from "@/lib/schema";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patientIdFilter, setPatientIdFilter] = useState("");
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    patientId?: string;
    title?: string;
    audio?: string;
  }>({});

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    consultationId: string | null;
  }>({ isOpen: false, consultationId: null });

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!patientId.trim()) errors.patientId = "Patient ID is required";
    if (!title.trim()) errors.title = "Title is required";
    return errors;
  };

  useEffect(() => {
    fetchConsultations();
  }, [patientIdFilter]);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const url = patientIdFilter
        ? `/api/consultations?patientId=${patientIdFilter}`
        : "/api/consultations";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch consultations");
      const data = await response.json();
      setConsultations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await saveRecording(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to access microphone. Please check permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      // Smooth form experience
      setIsSaving(true);
    }
  };

  const saveRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("patientId", patientId);
      formData.append("audioBlob", blob);

      const response = await fetch("/api/consultations", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save recording");

      const newConsultation = await response.json();
      setConsultations([newConsultation, ...consultations]);
      setTitle("");
      setPatientId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save recording."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteConsultation = (id: string) => {
    setDeleteConfirmation({ isOpen: true, consultationId: id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, consultationId: null });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.consultationId) return;
    
    try {
      const response = await fetch(
        `/api/consultations/${deleteConfirmation.consultationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete consultation");

      setConsultations(
        consultations.filter(
          (consultation) => consultation.id !== deleteConfirmation.consultationId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete consultation"
      );
    } finally {
      setDeleteConfirmation({ isOpen: false, consultationId: null });
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientId(e.target.value);
    if (validationErrors.patientId) {
      setValidationErrors(prev => ({ ...prev, patientId: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const renderConsultationItem = (consultation: Consultation) => (
    <div
      key={consultation.id}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-800">{consultation.title}</h3>
          <p className="text-sm text-gray-600">
            Patient ID: {consultation.patientId}
          </p>
          <p className="text-sm text-gray-500">
            Recorded: {formatDate(consultation.recordedAt)}
          </p>
        </div>
        <button
          onClick={() => requestDeleteConsultation(consultation.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
      <div className="mt-3">
        <audio
          controls
          className="w-full"
          src={`data:audio/wav;base64,${Buffer.from(
            consultation.audioBlob
          ).toString("base64")}`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Medical Consultation Recorder
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            New Consultation
          </h2>
          <div className="space-y-4">
            {/* Patient ID Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientId}
                onChange={handlePatientIdChange}
                disabled={isRecording || isSaving}
                className={`w-full px-3 py-2 border
                ${
                  validationErrors.patientId ? "border-red-500" : "border-gray-300"
                }
                ${
                  isRecording || isSaving ? "bg-gray-300 cursor-not-allowed" : ""
                }
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter patient ID"
              />
              {validationErrors.patientId && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.patientId}
                </p>
              )}
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className={`w-full px-3 py-2 border 
                ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                }
                ${
                  isRecording || isSaving ? "bg-gray-300 cursor-not-allowed" : ""
                }
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter consultation title"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSaving || (isRecording ? false : (!patientId || !title))}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : (isSaving || !patientId || !title)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              {isRecording && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-600">Recording...</span>
                </div>
              )}
              {isSaving && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Consultation History
            </h2>
            <div className="flex items-center">
              <label
                htmlFor="patientFilter"
                className="mr-2 text-sm font-medium text-gray-700"
              >
                Filter by Patient ID:
              </label>
              <input
                type="text"
                id="patientFilter"
                value={patientIdFilter}
                onChange={(e) => setPatientIdFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient ID"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : consultations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No consultations found
            </p>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                renderConsultationItem(consultation)
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Consultation"
        message="Are you sure you want to delete this consultation? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
