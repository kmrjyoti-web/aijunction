
import { FormSchema } from '../../models/form-schema.model';

export const PRODUCT_MASTER_SCHEMA: FormSchema = {
  title: 'Product Master',
  description: 'Manage product details, pricing, tax information, and linked products.',
  layout: 'standard',
  rows: [
    // Product Detail Section (Inside Fieldset)
    {
      columns: [
        {
          span: 'col-span-12',
          field: {
            key: 'basicDetails',
            type: 'fieldset',
            label: 'Basic Details',
            props: {
              rows: [
                {
                  columns: [
                     { 
                         span: 'col-span-12', 
                         field: { 
                             key: 'productName', 
                             type: 'text', 
                             label: 'Product Name', 
                             prefixIcon: 'tag',
                             validators: { required: true }
                         } 
                     },
                     { 
                         span: 'col-span-12', 
                         field: { 
                             key: 'shortDescription', 
                             type: 'textarea', 
                             label: 'Short Description', 
                             prefixIcon: 'documentText',
                             props: { rows: 2 }
                         } 
                     }
                  ]
                },
                {
                   columns: [
                     { span: 'col-span-6', field: { key: 'brand', type: 'text', label: 'Brand', prefixIcon: 'layers' } },
                     { 
                         span: 'col-span-6', 
                         field: { 
                             key: 'searchGroup', 
                             type: 'select', 
                             label: 'Search...', 
                             options: [
                                { label: 'Group A', value: 'a' },
                                { label: 'Group B', value: 'b' }
                             ] 
                         } 
                     }
                   ]
                }
              ]
            }
          }
        }
      ]
    },
    // Pricing & Tax (Toggleable Fieldset)
    {
      columns: [
        {
          span: 'col-span-12',
          field: {
            key: 'pricingDetails',
            type: 'fieldset',
            label: 'Pricing & Taxes',
            props: {
              toggleable: true,
              rows: [
                {
                   columns: [
                     { span: 'col-span-4', field: { key: 'mrp', type: 'currency', label: 'Mrp', props: { currency: '₹' } } },
                     { span: 'col-span-4', field: { key: 'impMin', type: 'currency', label: 'Implementation Min', props: { currency: '₹' } } },
                     { span: 'col-span-4', field: { key: 'impMax', type: 'currency', label: 'Implementation Max', props: { currency: '₹' } } }
                   ]
                },
                {
                   columns: [
                     { span: 'col-span-3', field: { key: 'hsn', type: 'text', label: 'HSN Code', prefixIcon: 'tag' } },
                     { span: 'col-span-3', field: { key: 'igst', type: 'number', label: 'IGST (%)', prefixIcon: 'percent' } },
                     { span: 'col-span-3', field: { key: 'cgst', type: 'number', label: 'CGST (%)', prefixIcon: 'percent' } },
                     { span: 'col-span-3', field: { key: 'sgst', type: 'number', label: 'SGST (%)', prefixIcon: 'percent' } }
                   ]
                }
              ]
            }
          }
        }
      ]
    },
    // Licence (Collapsed by default)
    {
      columns: [
        {
          span: 'col-span-12',
          field: {
            key: 'licenceDetails',
            type: 'fieldset',
            label: 'Licence Information',
            props: {
              toggleable: true,
              collapsed: true,
              rows: [
                 {
                   columns: [
                      { 
                          span: 'col-span-4', 
                          field: { 
                              key: 'licenceDetail', 
                              type: 'select', 
                              label: 'Licence Detail', 
                              options: [{label: 'Prepaid', value: 'prepaid'}, {label: 'Postpaid', value: 'postpaid'}] 
                          } 
                      },
                      { span: 'col-span-4', field: { key: 'licenceCharge', type: 'currency', label: 'Licence Charge', props: { currency: '₹' } } },
                      { span: 'col-span-4', field: { key: 'amcCharge', type: 'currency', label: 'Amc Charge', props: { currency: '₹' } } }
                   ]
                }
              ]
            }
          }
        }
      ]
    },
    // Linked Product & File Upload
    {
        columns: [
            { span: 'col-span-12', field: { key: 'linkedProductSwitch', type: 'switch', label: 'Linked Product' } },
            
            // New Unified Search & List Control
            { 
                span: 'col-span-12', 
                field: { 
                    key: 'linkedProducts', 
                    type: 'list-checkbox', 
                    label: 'Select Linked Products', 
                    placeholder: 'Search for products...',
                    options: [
                        { label: 'Demo 1', value: 'd1' },
                        { label: 'Demo 2', value: 'd2' },
                        { label: 'Demo Product', value: 'dp' },
                        { label: 'Demo Product With Link', value: 'dpl' },
                        { label: 'Marg Erp Silver', value: 'mes' },
                        { label: 'Marg Erp Silver Update Single user', value: 'mesu' },
                        { label: 'Counter ERP', value: 'cerp' },
                        { label: 'Accounting Pro', value: 'apro' },
                        { label: 'Inventory Master', value: 'im' },
                        { label: 'Payroll System', value: 'ps' },
                        { label: 'GST File Utility', value: 'gfu' }
                    ],
                    props: { maxHeight: '300px', maxChips: 5 } 
                } 
            },
             { 
                span: 'col-span-12', 
                field: { 
                    key: 'productImage', 
                    type: 'file-upload', 
                    label: 'Product Image',
                    props: { accept: 'image/*', maxSize: '5MB' }
                } 
            }
        ]
    }
  ]
};
