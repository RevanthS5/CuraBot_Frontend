import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Search, Filter } from 'lucide-react';
import { patientAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  doctorName: string;
  description: string;
  fileUrl?: string;
}

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const recordTypes = [
    'Lab Result', 
    'Prescription', 
    'Diagnosis', 
    'Imaging', 
    'Vaccination', 
    'Surgery'
  ];

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setIsLoading(true);
        const response = await patientAPI.getMedicalRecords();
        console.log('Medical records:', response.data);
        setRecords(response.data.records || []);
        setFilteredRecords(response.data.records || []);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    // Filter records based on search term and type filter
    const filtered = records.filter(record => {
      const matchesSearch = 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter ? record.type === typeFilter : true;
      
      return matchesSearch && matchesType;
    });
    
    setFilteredRecords(filtered);
  }, [searchTerm, typeFilter, records]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search medical records..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {recordTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
          <p className="text-gray-500">
            {records.length === 0 
              ? "You don't have any medical records yet." 
              : "No records match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                      {record.type}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    <span>Dr. {record.doctorName}</span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {record.description}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    to={`/patient/records/${record.id}`}
                  >
                    View Details
                  </Button>
                  
                  {record.fileUrl && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDownload(record.fileUrl!, `${record.title}.pdf`)}
                      rightIcon={<Download className="h-4 w-4" />}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
