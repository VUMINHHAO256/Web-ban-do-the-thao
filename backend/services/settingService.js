const settingRepository = require('../repositories/settingRepository');

class SettingService {
    async getAllSettings() {
        return await settingRepository.findAll();
    }

    async getSettingByKey(key) {
        const setting = await settingRepository.findByKey(key);
        if (!setting) {
            throw new Error('Cài đặt không tồn tại');
        }
        return setting;
    }

    async updateSetting(key, settingData) {
        const existing = await settingRepository.findByKey(key);
        if (!existing) {
            throw new Error('Cài đặt không tồn tại để cập nhật');
        }

        await settingRepository.update(key, settingData);
        return { message: 'Cập nhật cài đặt thành công' };
    }

    async createSetting(settingData) {
        if (!settingData.key || !settingData.value) {
            throw new Error('Vui lòng điền khóa và giá trị cài đặt');
        }
        
        const existing = await settingRepository.findByKey(settingData.key);
        if (existing) {
            throw new Error('Khóa cài đặt đã tồn tại');
        }

        await settingRepository.create(settingData);
        return { message: 'Thêm cài đặt thành công' };
    }
}

module.exports = new SettingService();