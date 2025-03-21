import { useState, useCallback, useContext, useEffect } from 'react';
import { User, } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { 
  createContact, 
  updateContact, 
  formatPhoneNumber, 
  splitPhoneNumber,
  countryPrefixes 
} from "/src/services/contacts.js";
import { UpdateContactForm, ContactHandle } from "/src/contexts/chats.js";
import Select from 'react-select';


const NewContact = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { contactFind, setContactFind } = useContext(UpdateContactForm);
  const { setContactHandle } = useContext(ContactHandle);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idContact, setIdContact] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [, setCountryCode] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const isFormValid = firstName.trim() && lastName.trim() && phoneNumber.trim() && selectedCountry?.value;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();

        const filteredData = data
          .map(country => {
            const callingCode = country.idd && country.idd.root && country.idd.suffixes
              ? `${country.idd.root.replace('+', '')}${country.idd.suffixes[0]}`
              : '';

            return {
              label: country.name.common,
              value: callingCode,
              flag: country.flags.svg,
              callingCode: callingCode,
            };
          })
          .filter(country => country.value) // Filtrar solo los que tienen código de llamada
          .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabéticamente

        setCountries(filteredData);
        
        // Buscar Ecuador en la lista y establecerlo como valor por defecto
        const ecuador = filteredData.find(country => country.label === 'Ecuador');
        if (ecuador && !selectedCountry && !contactFind) {
          setSelectedCountry(ecuador);
          setCountryCode(ecuador.value);
        }
      } catch (error) {
        console.error('Error al cargar países: ', error);
      }
    };

    fetchCountries();
  }, [selectedCountry, contactFind]);

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setCountryCode(selectedOption.value);
    // Validar el número de teléfono nuevamente cuando cambia el país
    if (phoneNumber) {
      validatePhoneNumber(phoneNumber);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Aquí puedes añadir validaciones específicas
    if (phone.length < 3) {
      setPhoneError('Número de teléfono demasiado corto');
      return false;
    }
    
    // Validar según país seleccionado si está disponible
    if (selectedCountry?.value && countryPrefixes[selectedCountry.value]) {
      const prefixInfo = countryPrefixes[selectedCountry.value];
      const cleanPhone = phone.replace(/\D/g, "");
      
      // Si el número es más largo que el estándar del país, mostrar una advertencia
      if (cleanPhone.length > prefixInfo.standardLength) {
        setPhoneError(`Se eliminarán dígitos adicionales para cumplir con el formato de ${prefixInfo.name} (${prefixInfo.standardLength} dígitos)`);
        
        // Configurar un temporizador para borrar el mensaje después de 5 segundos
        setTimeout(() => {
          setPhoneError('');
        }, 5000);
      } else if (cleanPhone.length < prefixInfo.standardLength) {
        setPhoneError(`El número para ${prefixInfo.name} debería tener ${prefixInfo.standardLength} dígitos`);
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
    
    return true;
  };

  // Cargar datos del contacto cuando se va a editar
  useEffect(() => {
    if (contactFind && countries.length > 0) {
      console.log("Contacto a editar ", contactFind);

      // Separar el nombre completo en nombre y apellido si es posible
      const nameParts = contactFind.name ? contactFind.name.split(' ') : ['', ''];
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      // Separar el código de país y el número de teléfono
      const { countryCode: extractedCode, phoneNumber: extractedNumber } = 
        splitPhoneNumber(contactFind.phone_number || '');
      
      setIdContact(contactFind.id);
      setFirstName(fName);
      setLastName(lName);
      setPhoneNumber(extractedNumber);
      setPhoneError(''); // Limpiar errores anteriores
      
      // Establecer el país seleccionado basado en el código extraído
      if (extractedCode) {
        const matchedCountry = countries.find(country => country.value === extractedCode);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setCountryCode(matchedCountry.value);
        }
      }
    }
  }, [contactFind, countries]);

  // Efecto para limpiar el mensaje de éxito después de un tiempo
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);

  const handleCancelEdit = () => {
    setError(null);
    setSuccess(false);
    setContactFind(null);
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setPhoneError('');
    setSelectedCountry(null);
    setCountryCode('');
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  const handleCreateContact = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);
        setPhoneError(''); // Limpiar mensajes de error al guardar

        // Formatear el número de teléfono según los requisitos
        const formattedPhone = formatPhoneNumber(phoneNumber, selectedCountry.value);

        const formContactData = {
          "name": `${firstName} ${lastName}`.trim(),
          "phone_number": formattedPhone
        };

        try {
          const response = await callEndpoint(createContact(formContactData));
          console.log("Contacto creado ", response);
          setSuccess("Contacto creado con éxito");
          setContactHandle(true);

          // Resetear el formulario
          setFirstName('');
          setLastName('');
          setPhoneNumber('');
          // Restaurar Ecuador como país por defecto
          const ecuador = countries.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
          } else {
            setSelectedCountry(null);
            setCountryCode('');
          }
        } catch (error) {
          console.error("Error creando contacto ", error);
          setError("Error al crear el contacto: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, phoneNumber, isFormValid, callEndpoint, setContactHandle, selectedCountry, countries]
  );

  const handleUpdateContact = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);
        setPhoneError(''); // Limpiar mensajes de error al actualizar

        // Formatear el número de teléfono según los requisitos
        const formattedPhone = formatPhoneNumber(phoneNumber, selectedCountry.value);

        const formContactData = {
          "name": `${firstName} ${lastName}`.trim(),
          "phone_number": formattedPhone
        };

        try {
          const response = await callEndpoint(updateContact(idContact, formContactData));
          console.log("Contacto actualizado ", response);
          setSuccess("Contacto actualizado con éxito");
          setContactHandle(true);
          setContactFind(null);

          // Resetear el formulario
          setFirstName('');
          setLastName('');
          setPhoneNumber('');

          // Restaurar Ecuador como país por defecto
          const ecuador = countries.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
            
            console.log(`País seleccionado: ${ecuador.label} - Código: ${ecuador.value} - Bandera: ${ecuador.flag}`);
          } else {
            setSelectedCountry(null);
            setCountryCode('');
          }
        } catch (error) {
          console.error("Error actualizando contacto ", error);
          setError("Error al actualizar el contacto: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, phoneNumber, isFormValid, callEndpoint, idContact, setContactFind, setContactHandle, selectedCountry, countries]
  );

  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <User size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">{contactFind ? 'Editar Contacto' : 'Nuevo Contacto'}</h1>
      </div>

      {/* Form */}
      <div className="p-4 flex-1 flex flex-col">
        {/* First name */}
        <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Last name */}
        <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="w-1/2">
              <Select
                value={selectedCountry}
                onChange={handleCountryChange}
                options={countries.map(country => ({
                  label: (
                    <div className="flex items-center space-x-2">
                      <img src={country.flag} alt={country.label} className="w-5 h-5" />
                      <span>+{country.callingCode} {country.label}</span>
                    </div>
                  ),
                  value: country.value,
                  flag: country.flag,
                  callingCode: country.callingCode,
                }))}
                placeholder="Código de país"
                className="text-white"
                openMenuOnClick={false}
                openMenuOnFocus={true}
                onKeyDown={(e) => {
                  // Abrir el menú al presionar cualquier tecla
                  if (!e.target.className.includes("is-open")) {
                    e.preventDefault();
                    e.target.click();
                  }
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#1f2937',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                }}
              />
            </div>
            <div className="w-1/2">
              <input
                type="text"
                placeholder="Número de teléfono"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full p-2 bg-gray-800 text-white rounded-md"
              />
            </div>
          </div>
          
          {phoneError && (
            <div className="text-yellow-500 text-xs mt-1">
              {phoneError}
            </div>
          )}
        </div>

        {/* Success and Error Messages */}
        {error && (
          <div className="text-red-500 text-sm mb-4 mt-4">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-sm mb-4 mt-4">
            {success}
          </div>
        )}

        {/* Save or Update button */}
        {contactFind ? (
          <div className="flex space-x-4 mb-6 mt-6">
            <button
              onClick={handleUpdateContact}
              disabled={!isFormValid || loading}
              className="py-2 px-4 rounded bg-naranja-base text-white transition-colors duration-300 hover:bg-naranja-medio disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="py-2 px-4 rounded bg-red-500 text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-6 mb-6">
            <button
              disabled={!isFormValid || loading}
              onClick={handleCreateContact}
              className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600
                       transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewContact;