import { useState, useCallback, useContext, useEffect } from 'react';
import { User } from 'lucide-react';
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndLoad.jsx";
import {
  createContact,
  updateContact,
  formatPhoneNumber,
  splitPhoneNumber,
  countryPrefixes
} from "@/services/contacts.js";
import { UpdateContactForm, ContactHandle, NewContactForm } from "@/contexts/chats.js";
import Select from 'react-select';
import toast from "react-hot-toast";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

const NewContact = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { contactFind, setContactFind } = useContext(UpdateContactForm);
  const { setContactHandle } = useContext(ContactHandle);
  const { setContactNew } = useContext(NewContactForm);
  const { theme } = useTheme();


  const [firstName, setFirstName] = useState('');
  const [relatedSync, setRelatedSync] = useState('');
  const [lastName, setLastName] = useState('');
  const [idContact, setIdContact] = useState('');
  const [, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [, setCountryCode] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [, setCountEdits] = useState(0); // Campo para control de ediciones
  const [canEdit, setCanEdit] = useState(true); // Estado para controlar si se puede editar

  const isFormValid = firstName.trim() && lastName.trim() && phoneNumber.trim() && selectedCountry?.value;

  // Efecto para asegurar que el formulario permanezca abierto en modo edición
  useEffect(() => {
    if (contactFind) {
      setContactNew(true);
    }
  }, [isMobile, contactFind, setContactNew]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validar que data sea un array
        if (!Array.isArray(data)) {
          console.error('La respuesta de la API no es un array:', data);
          return;
        }

        const filteredData = data
          .map(country => {
            // Validar que el país tenga la estructura esperada
            if (!country || !country.name || !country.name.common) {
              return null;
            }

            const callingCode = country.idd && country.idd.root && country.idd.suffixes
              ? `${country.idd.root.replace('+', '')}${country.idd.suffixes[0]}`
              : '';

            return {
              label: country.name.common,
              value: callingCode,
              callingCode: callingCode,
            };
          })
          .filter(country => country && country.value) // Filtrar países nulos y sin código
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountries(filteredData);

        // Establecer Ecuador por defecto si no hay un contacto seleccionado
        if (!selectedCountry && !contactFind) {
          const ecuador = filteredData.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
          }
        }
      } catch (error) {
        console.error('Error al cargar países: ', error);
        const fallbackCountries = [
          { label: 'Ecuador', value: '593', callingCode: '593' },
          { label: 'Colombia', value: '57', callingCode: '57' },
          { label: 'Perú', value: '51', callingCode: '51' },
          { label: 'Estados Unidos', value: '1', callingCode: '1' },
          { label: 'México', value: '52', callingCode: '52' },
        ];

        setCountries(fallbackCountries);

        // Establecer Ecuador por defecto
        if (!selectedCountry && !contactFind) {
          const ecuador = fallbackCountries.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
          }
        }
      }
    };

    fetchCountries();
  }, []);

  // Efecto para cargar datos de contacto en modo edición
  useEffect(() => {
    if (contactFind && countries.length > 0) {
      console.log("Contacto a editar ", contactFind);

      // Verificar el estado de count_edits
      const currentCountEdits = contactFind.count_edits || 0;
      setCountEdits(currentCountEdits);

      // Si count_edits es 1 o mayor, no se puede editar
      if (currentCountEdits >= 1) {
        setCanEdit(false);
        toast.error("Este contacto ya ha sido editado y no puede modificarse nuevamente");
        return;
      } else {
        setCanEdit(true);
      }

      const nameParts = contactFind.name ? contactFind.name.split(' ') : ['', ''];
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      const { countryCode: extractedCode, phoneNumber: extractedNumber } =
        splitPhoneNumber(contactFind.phone_number || '');

      setIdContact(contactFind.id);
      setFirstName(fName);
      setLastName(lName);
      setPhoneNumber(extractedNumber);
      setPhoneError('');

      if (extractedCode) {
        const matchedCountry = countries.find(country => country.value === extractedCode);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setCountryCode(matchedCountry.value);
        }
      }
    }
  }, [contactFind, countries.length]);

  // Efecto para limpiar mensaje de éxito
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

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setCountryCode(selectedOption.value);
    if (phoneNumber) {
      validatePhoneNumber(phoneNumber);
    }
  };

  const validatePhoneNumber = (phone) => {
    if (phone.length < 3) {
      setPhoneError('Número de teléfono demasiado corto');
      return false;
    }

    if (selectedCountry?.value && countryPrefixes[selectedCountry.value]) {
      const prefixInfo = countryPrefixes[selectedCountry.value];
      const cleanPhone = phone.replace(/\D/g, "");

      if (cleanPhone.length > prefixInfo.standardLength) {
        setPhoneError(`Se eliminarán dígitos adicionales para cumplir con el formato de ${prefixInfo.name} (${prefixInfo.standardLength} dígitos)`);

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

  const handleCancelEdit = () => {
    setError(null);
    setSuccess(false);
    setContactFind(null);
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setPhoneError('');
    setCountEdits(0);
    setCanEdit(true);

    const ecuador = countries.find(country => country.label === 'Ecuador');
    if (ecuador) {
      setSelectedCountry(ecuador);
      setCountryCode(ecuador.value);
    } else {
      setSelectedCountry(null);
      setCountryCode('');
    }
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
        setPhoneError('');

        const formattedPhone = formatPhoneNumber(phoneNumber, selectedCountry.value);

        const formContactData = {
          "name": `${firstName} ${lastName}`.trim(),
          "phone_number": formattedPhone,
          "profile_picture": "",
          "count_edits": 0,// Inicializar en 0 para nuevos contactos
          "sync_id": relatedSync || null
        };

        try {
          const response = await callEndpoint(createContact(formContactData));
          if (response.status !== 200) {
            toast.error(response.message)

          } else {
            toast.success(response.message)
            setContactHandle(true);
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setCountEdits(0);
          }

          const ecuador = countries.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
          } else {
            setSelectedCountry(null);
            setCountryCode('');
          }
        } catch (error) {
          toast.error("Error creando contacto")
          console.error("Error creando contacto ", error);
          setError("Error al crear el contacto: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, phoneNumber, isFormValid, callEndpoint, setContactHandle, selectedCountry, countries]
  );

  const handleUpdateContact = useCallback(
    async () => {
      if (isFormValid && canEdit) {
        setError(null);
        setPhoneError('');

        const formattedPhone = formatPhoneNumber(phoneNumber, selectedCountry.value);

        const formContactData = {
          "name": `${firstName} ${lastName}`.trim(),
          "phone_number": formattedPhone,
          "count_edits": 1, // Establecer en 1 al actualizar
          "sync_id": relatedSync || null
        };

        try {
          const response = await callEndpoint(updateContact(idContact, formContactData));
          toast.success("Contacto actualizado con éxito")
          console.log("Contacto actualizado ", response);

          if (response.status !== 200) {
            setError(response.message || "Error al actualizar el contacto");
            toast.error(response.message || "Error al actualizar el contacto");
          } else {
            setSuccess("Contacto actualizado con éxito");
            toast.error(response.message || "Contacto actualizado con éxito");
          }
          setContactHandle(true);
          setContactFind(null);

          // Resetear el formulario
          setFirstName('');
          setLastName('');
          setPhoneNumber('');
          setCountEdits(0);
          setRelatedSync('');
          setCanEdit(true);

          const ecuador = countries.find(country => country.label === 'Ecuador');
          if (ecuador) {
            setSelectedCountry(ecuador);
            setCountryCode(ecuador.value);
          } else {
            setSelectedCountry(null);
            setCountryCode('');
          }
        } catch (error) {
          setError("Error al actualizar el contacto: " + (error.message || "Verifica la conexión"));
        }
      } else if (!canEdit) {
        toast.error("Este contacto ya ha sido editado y no puede modificarse nuevamente");
      }
    },
    [firstName, lastName, phoneNumber, isFormValid, callEndpoint, idContact, setContactFind, setContactHandle, selectedCountry, countries, canEdit]
  );

  // Determinamos si debemos mostrar el formulario:
  // - Si existe contactFind (modo edición) y tenemos permiso de edición
  // - O si no existe contactFind (modo creación) y tenemos permiso de creación
  const shouldShowForm = contactFind ? true : false;

  return (
    // Verificamos primero si el usuario tiene permiso general para ver contactos
    <AbilityGuard abilities={[ABILITIES.CONTACTS.VIEW]} fallback={
      <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 flex flex-col items-center justify-center h-max`}>
      </div>
    }>
      {/* Si debemos mostrar el formulario o si tiene permisos de creación */}
      <AbilityGuard abilities={shouldShowForm ? [ABILITIES.CONTACTS.EDIT] : [ABILITIES.CONTACTS.CREATE]} fallback={
        <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 flex flex-col items-center justify-center h-max`}>
        </div>
      }>
        <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
          {/* Header */}
          <div className={`flex items-center p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
            <User size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-4`} />
            <h1 className={`text-xl font-normal text-[rgb(var(--color-text-primary-${theme}))]`}>{contactFind ? 'Editar Contacto' : 'Nuevo Contacto'}</h1>
          </div>
          {/* Form */}
          <div className="p-4 flex-1 flex flex-col space-y-6">
            {/* First Name */}
            <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
              <input
                type="text"
                placeholder="Nombres"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={contactFind && !canEdit}
                className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none ${contactFind && !canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Last Name */}
            <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
              <input
                type="text"
                placeholder="Apellidos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={contactFind && !canEdit}
                className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none ${contactFind && !canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Phone Section */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <Select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    options={countries.map(country => ({
                      label: (
                        <div className="flex items-center space-x-2">
                          <span>+{country.callingCode} {country.label}</span>
                        </div>
                      ),
                      value: country.value,
                      callingCode: country.callingCode,
                    }))}
                    placeholder="Código de país"
                    isDisabled={contactFind && !canEdit}
                    className={`text-[rgb(var(--color-text-primary-${theme}))]`}
                    openMenuOnClick={false}
                    openMenuOnFocus={true}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: `rgb(var(--color-bg-${theme}-secondary))`,
                        borderColor: `rgb(var(--color-text-secondary-${theme}))`,
                        opacity: contactFind && !canEdit ? 0.5 : 1,
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: `rgb(var(--color-bg-${theme}-secondary))`,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? `rgb(var(--color-primary-${theme}))`
                          : `rgb(var(--color-bg-${theme}-secondary))`,
                        color: `rgb(var(--color-text-primary-${theme}))`,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: `rgb(var(--color-text-primary-${theme}))`,
                      }),
                      input: (base) => ({
                        ...base,
                        color: `rgb(var(--color-text-primary-${theme}))`,
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
                    disabled={contactFind && !canEdit}
                    className={`w-full p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] rounded-md ${contactFind && !canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {phoneError && (
                <div className="text-yellow-500 text-xs mt-1">
                  {phoneError}
                </div>
              )}
            </div>

            <div className="w-1/2">
              <input
                type="text"
                placeholder="Credito Relacionado"
                value={relatedSync}
                onChange={(e) => setRelatedSync(e.target.value)}
                disabled={contactFind && !canEdit}
                className={`w-full p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] rounded-md ${contactFind && !canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Save Button - solo visible con permisos específicos */}
            <div>
              {contactFind ? (
                <AbilityGuard abilities={[ABILITIES.CONTACTS.EDIT]}>
                  <div className='flex space-x-4'>
                    <button
                      onClick={handleUpdateContact}
                      disabled={!isFormValid || loading || !canEdit}
                      className={`py-2 px-4 rounded bg-[rgb(var(--color-primary-${theme}))] text-[rgb(var(--color-text-primary-${theme}))] transition-colors duration-300 hover:bg-[rgb(var(--color-secondary-${theme}))] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? 'Guardando...' : canEdit ? 'Actualizar' : 'No editable'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="py-2 px-4 rounded bg-red-500 text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </AbilityGuard>
              ) : (
                <AbilityGuard abilities={[ABILITIES.CONTACTS.CREATE]}>
                  <button
                    disabled={!isFormValid || loading}
                    onClick={handleCreateContact}
                    className={`w-full py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </AbilityGuard>
              )}
            </div>
          </div>
        </div>
      </AbilityGuard>
    </AbilityGuard>
  );
};

export default NewContact;