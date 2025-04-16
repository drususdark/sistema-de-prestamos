import React from 'react';
import { Form } from 'react-bootstrap';

// Componente para validación de formularios
const FormValidator = {
  // Validar que un campo no esté vacío
  validateRequired: (value) => {
    if (!value || value.trim() === '') {
      return 'Este campo es obligatorio';
    }
    return null;
  },

  // Validar que un campo tenga una longitud mínima
  validateMinLength: (value, minLength) => {
    if (!value || value.length < minLength) {
      return `Este campo debe tener al menos ${minLength} caracteres`;
    }
    return null;
  },

  // Validar que un campo tenga una longitud máxima
  validateMaxLength: (value, maxLength) => {
    if (value && value.length > maxLength) {
      return `Este campo no puede tener más de ${maxLength} caracteres`;
    }
    return null;
  },

  // Validar que un campo sea una fecha válida
  validateDate: (value) => {
    if (!value) {
      return 'La fecha es obligatoria';
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return null;
  },

  // Validar que un campo sea una fecha futura
  validateFutureDate: (value) => {
    if (!value) {
      return 'La fecha es obligatoria';
    }
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    if (date < today) {
      return 'La fecha debe ser igual o posterior a hoy';
    }
    
    return null;
  },

  // Validar que un array tenga al menos un elemento
  validateArrayNotEmpty: (array) => {
    if (!array || array.length === 0) {
      return 'Debe agregar al menos un elemento';
    }
    
    return null;
  },

  // Validar que todos los elementos de un array no estén vacíos
  validateArrayItemsNotEmpty: (array) => {
    if (!array || array.length === 0) {
      return 'Debe agregar al menos un elemento';
    }
    
    const emptyItems = array.filter(item => !item || item.trim() === '');
    if (emptyItems.length > 0) {
      return 'Todos los elementos deben tener contenido';
    }
    
    return null;
  },

  // Componente de campo de formulario con validación
  FormField: ({ label, name, type, value, onChange, error, placeholder, required, options, disabled }) => {
    return (
      <Form.Group className="mb-3">
        <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
        
        {type === 'select' ? (
          <Form.Select
            name={name}
            value={value}
            onChange={onChange}
            isInvalid={!!error}
            disabled={disabled}
            required={required}
          >
            <option value="">{placeholder || 'Seleccione una opción'}</option>
            {options && options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        ) : type === 'textarea' ? (
          <Form.Control
            as="textarea"
            rows={3}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isInvalid={!!error}
            disabled={disabled}
            required={required}
          />
        ) : (
          <Form.Control
            type={type || 'text'}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isInvalid={!!error}
            disabled={disabled}
            required={required}
          />
        )}
        
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      </Form.Group>
    );
  }
};

export default FormValidator;
