# React Frontend Integration Guide

Complete guide for integrating your React frontend with the FastAPI backend.

## 📚 Table of Contents

1. [API Service Usage](#api-service-usage)
2. [Component Integration](#component-integration)
3. [Error Handling](#error-handling)
4. [State Management](#state-management)
5. [Examples](#examples)

## 🔌 API Service Usage

The API service is located at `src/services/api.ts` and provides:

### Core Functions

#### `uploadInvoice(file: File): Promise<UploadResponse>`

Upload a PDF file and extract invoice data.

```typescript
import { uploadInvoice, ExtractedInvoiceData } from './services/api';

try {
  const response = await uploadInvoice(pdfFile);
  console.log(response.data);
} catch (error) {
  console.error(error);
}
```

#### `validateFile(file: File): void`

Validate file before upload.

```typescript
import { validateFile, ValidationError } from './services/api';

try {
  validateFile(selectedFile);
} catch (error: ValidationError) {
  console.error(error.message);
}
```

#### `checkBackendHealth(): Promise<boolean>`

Check if backend API is running.

```typescript
import { checkBackendHealth } from './services/api';

const isBackendRunning = await checkBackendHealth();
if (!isBackendRunning) {
  console.error('Backend is not running');
}
```

#### `formatInvoiceData(data: ExtractedInvoiceData): Record<string, unknown>`

Format extracted data for display.

```typescript
import { formatInvoiceData } from './services/api';

const formatted = formatInvoiceData(extractedData);
console.log(formatted);
// Output:
// {
//   "Invoice Number": "INV-2024-001",
//   "Invoice Date": "2024-01-15",
//   ...
// }
```

#### `getErrorMessage(error: unknown): string`

Get user-friendly error message.

```typescript
import { getErrorMessage } from './services/api';

try {
  // ... API call
} catch (error) {
  const message = getErrorMessage(error);
  showSnackbar(message, 'error');
}
```

## 🎨 Component Integration

### Upload Component

```typescript
// src/components/Uploadzone.tsx
import { uploadInvoice, APIError, ValidationError, getErrorMessage } from '../services/api';

function Uploadzone() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await uploadInvoice(file);
      
      if (response.success && response.data) {
        // Handle successful upload
        onUploadSuccess(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-zone">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={isLoading}
      />
      {isLoading && <p>Processing...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Invoice Display Component

```typescript
// src/components/InvoiceDisplay.tsx
import { ExtractedInvoiceData, formatInvoiceData } from '../services/api';

interface Props {
  data: ExtractedInvoiceData;
}

function InvoiceDisplay({ data }: Props) {
  const formatted = formatInvoiceData(data);

  return (
    <div className="invoice-display">
      <h2>Extracted Invoice Data</h2>
      <table>
        <tbody>
          {Object.entries(formatted).map(([key, value]) => (
            <tr key={key}>
              <td><strong>{key}</strong></td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## ⚠️ Error Handling

The API service provides three custom error classes:

### `APIError`

```typescript
import { APIError } from './services/api';

try {
  await uploadInvoice(file);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    console.error(`Detail: ${error.detail}`);
  }
}
```

### `ValidationError`

```typescript
import { ValidationError } from './services/api';

try {
  validateFile(file);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation Error: ${error.message}`);
  }
}
```

### `NetworkError`

```typescript
import { NetworkError } from './services/api';

try {
  await uploadInvoice(file);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error(`Network Error: ${error.message}`);
    console.error('Make sure FastAPI backend is running');
  }
}
```

## 🎯 State Management

### Using React Context

```typescript
// src/context/InvoiceContext.tsx
import { createContext, useState } from 'react';
import { ExtractedInvoiceData } from '../services/api';

interface InvoiceContextType {
  invoices: ExtractedInvoiceData[];
  addInvoice: (data: ExtractedInvoiceData) => void;
  removeInvoice: (id: string) => void;
}

export const InvoiceContext = createContext<InvoiceContextType | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<ExtractedInvoiceData[]>([]);

  const addInvoice = (data: ExtractedInvoiceData) => {
    setInvoices([...invoices, data]);
  };

  const removeInvoice = (id: string) => {
    setInvoices(invoices.filter((_, i) => i.toString() !== id));
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, removeInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

// Usage in component
function MyComponent() {
  const context = useContext(InvoiceContext);
  if (!context) return null;

  return (
    <div>
      {context.invoices.map((invoice, i) => (
        <div key={i}>
          {invoice.invoice_number}
        </div>
      ))}
    </div>
  );
}
```

## 💡 Examples

### Complete Upload & Display Example

```typescript
import React, { useState } from 'react';
import {
  uploadInvoice,
  ExtractedInvoiceData,
  formatInvoiceData,
  getErrorMessage,
} from './services/api';

function InvoiceApp() {
  const [data, setData] = useState<ExtractedInvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await uploadInvoice(file);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Invoice Extractor</h1>

      <div className="upload-section">
        <label>
          Select PDF:
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </div>

      {isLoading && <p>Processing invoice...</p>}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="results">
          <h2>Extracted Data</h2>
          <table>
            <tbody>
              {Object.entries(formatInvoiceData(data)).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InvoiceApp;
```

### With Snackbar Notifications

```typescript
import Snackbar from './components/Snackbar';

function InvoiceApp() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as const,
  });

  const showNotification = (message: string, severity: 'error' | 'success' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadInvoice(file);
      showNotification(response.message, 'success');
    } catch (error) {
      showNotification(getErrorMessage(error), 'error');
    }
  };

  return (
    <>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
}
```

## 🔒 Security Best Practices

1. **Always validate files client-side**
   ```typescript
   validateFile(file); // Throws ValidationError if invalid
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     // API call
   } catch (error) {
     const userMessage = getErrorMessage(error);
     // Don't expose technical details to users
     showUserFriendlyError(userMessage);
   }
   ```

3. **Don't send sensitive data**
   ```typescript
   // ❌ Don't store raw PDF in state
   setState({ rawFile: file });

   // ✅ Only store processed data
   setState({ extractedData: response.data });
   ```

4. **Validate response data**
   ```typescript
   if (response.data?.confidence_score < 0.5) {
     showWarning('Extraction confidence is low. Please verify manually.');
   }
   ```

## 📊 TypeScript Interfaces

```typescript
// src/types/invoice.ts
export interface ExtractedInvoiceData {
  invoice_number: string | null;
  invoice_date: string | null;
  po_number: string | null;
  customer_name: string | null;
  gst_number: string | null;
  total_amount: string | null;
  raw_text?: string;
  page_count: number | null;
  confidence_score: number | null;
  extraction_method: string | null;
  processing_time_ms: number | null;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file_name?: string;
  file_id?: string;
  data?: ExtractedInvoiceData;
}
```

## 🧪 Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvoiceApp from './InvoiceApp';

describe('InvoiceApp', () => {
  it('should display success message on upload', async () => {
    render(<InvoiceApp />);
    
    const file = new File(['content'], 'invoice.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/select pdf/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/processed successfully/i)).toBeInTheDocument();
    });
  });

  it('should display error for invalid file', async () => {
    render(<InvoiceApp />);
    
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select pdf/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });
});
```

## 🚀 Performance Tips

1. **Use React.memo for components**
   ```typescript
   const InvoiceDisplay = React.memo(({ data }: Props) => {
     // Component code
   });
   ```

2. **Debounce upload triggers**
   ```typescript
   const handleUploadDebounced = useMemo(
     () => debounce(handleFileChange, 300),
     []
   );
   ```

3. **Lazy load result components**
   ```typescript
   const InvoiceResults = lazy(() => import('./InvoiceResults'));
   ```

## 📖 Resources

- [API Service](../services/api.ts)
- [FastAPI Backend Documentation](../backend/README.md)
- [Type Definitions](./models/invoice.ts)
