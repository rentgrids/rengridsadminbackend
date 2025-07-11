import { PropertyService } from '../services/PropertyService.js';
import { formatResponse } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validation.js';
import { createPropertySchema, updatePropertySchema, updateStatusSchema } from '../utils/validators/propertyValidators.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export class PropertyController {
  static getAllProperties = [
    verifyAdminJWT,
    requirePermission('property', 'view'),
    async (req, res) => {
      try {
        const filters = {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          search: req.query.search || '',
          status: req.query.status || '',
          city: req.query.city || '',
          type: req.query.type || '',
          purpose: req.query.purpose || '',
          is_featured: req.query.is_featured || ''
        };

        const result = await PropertyService.getAllProperties(filters);
        res.json(formatResponse(true, 'Properties retrieved successfully', result));
      } catch (error) {
        logger.error('PropertyController getAllProperties error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve properties'));
      }
    }
  ];

  static getPropertyById = [
    verifyAdminJWT,
    requirePermission('property', 'view'),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        const result = await PropertyService.getPropertyById(propertyId);
        res.json(formatResponse(true, 'Property retrieved successfully', result));
      } catch (error) {
        logger.error('PropertyController getPropertyById error:', error);
        if (error.message === 'Property not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to retrieve property'));
        }
      }
    }
  ];

  static createProperty = [
    verifyAdminJWT,
    requirePermission('property', 'create'),
    async (req, res) => {
      try {
        // Handle both JSON and form-data
        const proeprtyData = req.body;
        console.log('proeprtyData', req.body);
        // Parse arrays if they come as strings (from form-data)
        if (typeof propertyData.features === 'string') {
          propertyData.features = JSON.parse(propertyData.features);
        }
        if (typeof propertyData.amenities === 'string') {
          propertyData.amenities = JSON.parse(propertyData.amenities);
        }

        const result = await PropertyService.createProperty(propertyData);
        res.status(201).json(formatResponse(true, 'Property created successfully', result));
      } catch (error) {
        logger.error('PropertyController createProperty error:', error);
        res.status(400).json(formatResponse(false, error.message));
      }
    }
  ];

  static updateProperty = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        const propertyData = req.body;

        // Parse arrays if they come as strings (from form-data)
        if (typeof propertyData.features === 'string') {
          propertyData.features = JSON.parse(propertyData.features);
        }
        if (typeof propertyData.amenities === 'string') {
          propertyData.amenities = JSON.parse(propertyData.amenities);
        }

        await PropertyService.updateProperty(propertyId, propertyData);
        res.json(formatResponse(true, 'Property updated successfully'));
      } catch (error) {
        logger.error('PropertyController updateProperty error:', error);
        if (error.message === 'Property not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(400).json(formatResponse(false, error.message));
        }
      }
    }
  ];

  static updatePropertyStatus = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    validateRequest(updateStatusSchema),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        const { status } = req.body;
        await PropertyService.updatePropertyStatus(propertyId, status);
        res.json(formatResponse(true, `Property status updated to ${status}`));
      } catch (error) {
        logger.error('PropertyController updatePropertyStatus error:', error);
        if (error.message === 'Property not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to update property status'));
        }
      }
    }
  ];

  static deleteProperty = [
    verifyAdminJWT,
    requirePermission('property', 'delete'),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        await PropertyService.deleteProperty(propertyId);
        res.json(formatResponse(true, 'Property deleted successfully'));
      } catch (error) {
        logger.error('PropertyController deleteProperty error:', error);
        if (error.message === 'Property not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to delete property'));
        }
      }
    }
  ];

  static bulkDeleteProperties = [
    verifyAdminJWT,
    requirePermission('property', 'delete'),
    async (req, res) => {
      try {
        const { propertyIds } = req.body;

        if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
          return res.status(400).json(formatResponse(false, 'Property IDs array is required'));
        }

        const result = await PropertyService.bulkDeleteProperties(propertyIds);
        res.json(formatResponse(true, `${result.deletedCount} properties deleted successfully`, result));
      } catch (error) {
        logger.error('PropertyController bulkDeleteProperties error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete properties'));
      }
    }
  ];

  static uploadPropertyImages = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        const { images } = req.body;
        await PropertyService.uploadPropertyImages(propertyId, images);
        res.json(formatResponse(true, 'Images uploaded successfully'));
      } catch (error) {
        logger.error('PropertyController uploadPropertyImages error:', error);
        if (error.message === 'Property not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to upload images'));
        }
      }
    }
  ];

  static deletePropertyImage = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    async (req, res) => {
      try {
        const propertyId = req.params.id;
        const imageId = req.params.imageId;
        await PropertyService.deletePropertyImage(propertyId, imageId);
        res.json(formatResponse(true, 'Image deleted successfully'));
      } catch (error) {
        logger.error('PropertyController deletePropertyImage error:', error);
        if (error.message === 'Image not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to delete image'));
        }
      }
    }
  ];

  static getAllAmenities = [
    verifyAdminJWT,
    requirePermission('property', 'view'),
    async (req, res) => {
      try {
        const result = await PropertyService.getAllAmenities();
        res.json(formatResponse(true, 'Amenities retrieved successfully', result));
      } catch (error) {
        logger.error('PropertyController getAllAmenities error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve amenities'));
      }
    }
  ];

  static getPropertyStats = [
    verifyAdminJWT,
    requirePermission('property', 'view'),
    async (req, res) => {
      try {
        const result = await PropertyService.getPropertyStats();
        res.json(formatResponse(true, 'Property statistics retrieved successfully', result));
      } catch (error) {
        logger.error('PropertyController getPropertyStats error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve property statistics'));
      }
    }
  ];
}