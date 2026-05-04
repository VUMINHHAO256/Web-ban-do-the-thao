const settingService = require('../services/settingService');

class SettingController {
    async getAll(req, res) {
        try {
            const settings = await settingService.getAllSettings();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy cài đặt' });
        }
    }

    async getByKey(req, res) {
        try {
            const setting = await settingService.getSettingByKey(req.params.key);
            res.json(setting);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await settingService.updateSetting(req.params.key, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async create(req, res) {
        try {
            const result = await settingService.createSetting(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new SettingController();